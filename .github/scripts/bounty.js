const { Octokit } = require("@octokit/rest");
const { WebClient } = require("@slack/web-api");

const github = new Octokit({ auth: process.env.PERSONAL_ACCESS_TOKEN });
const slack = new WebClient(process.env.SLACK_WEBHOOK_URL);

const context = JSON.parse(process.env.GITHUB_CONTEXT);
const issue = context.payload.issue;
const comment = context.payload.comment;
const repository = context.payload.repository;
const sender = context.payload.sender;

async function run() {
    const bountyRegex = /\/bounty\s+\$(\d+)/;
    const match = comment.body.match(bountyRegex);

    if (!match) {
        return;
    }

    const bountyAmount = parseInt(match[1], 10);
    const issueNumber = issue.number;
    const repoOwner = repository.owner.login;
    const repoName = repository.name;
    const commenter = sender.login;

    // Get existing labels
    const { data: labels } = await github.issues.listLabelsOnIssue({
        owner: repoOwner,
        repo: repoName,
        issue_number: issueNumber,
    });

    // Calculate the new total bounty
    let totalBounty = bountyAmount;
    const bountyLabelPrefix = "$";
    const bountyLabel = labels.find((label) =>
        label.name.startsWith(bountyLabelPrefix)
    );

    if (bountyLabel) {
        const existingBounty = parseInt(bountyLabel.name.slice(1), 10);
        totalBounty += existingBounty;
    }

    // Update or create the bounty label
    const newBountyLabel = `${bountyLabelPrefix}${totalBounty}`;
    if (bountyLabel) {
        await github.issues.updateLabel({
            owner: repoOwner,
            repo: repoName,
            name: bountyLabel.name,
            new_name: newBountyLabel,
        });
    } else {
        await github.issues.addLabels({
            owner: repoOwner,
            repo: repoName,
            issue_number: issueNumber,
            labels: [newBountyLabel],
        });
    }

    // Post a comment confirming the bounty
    await github.issues.createComment({
        owner: repoOwner,
        repo: repoName,
        issue_number: issueNumber,
        body: `💰 A bounty has been added!\n\nThis issue now has a total bounty of $${totalBounty} thanks to @${commenter}.\nWant to contribute? Solve this issue and claim the reward.`,
    });

    // Send a message to Slack
    await slack.chat.postMessage({
        channel: "#bounties",
        text: `🚀 Bounty Alert!\n\n@${commenter} has added a $${bountyAmount} bounty to an issue: ${issue.html_url}.\nThe total bounty for this issue is now $${totalBounty}.\nContribute now and earn rewards!`,
    });
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});