# Summary

This document outlines the GitHub standards, including the branching strategy, commit message convention, pull request review process, merging policy, and examples.

## Branching Strategy

Create a branch off of the latest changes in main branch using the following steps:

```sh
git checkout main

git pull origin main 

git checkout -b <custom-branch>

```

Branches should be name by the following format:

`<short-description>-<ticket-number>`

Example: workflow-github-standards-19


## Commit Message Convention

Add a short summary statement as the title then add details in the description section and at the end add the ticket number in the following convention. Here is an example: 

    Added GitHub & Workflow Standards 
        - Added Branching Strategy
        - Added Commit Message Convention
        - Added Pull Request Review Process
        - Added Merging Policy 
        - Added examples
    Ticket Number: #19

## Pull Request Review Process

* Ensure that all individuals within the scope of work are added.
* Active members who are reviewing and approving, in addition to those within the scope of work, are: Gregory Navasarkian, Jake Peterson, and Samuel Sarkisian
* Ensure the ticket that is being reviewed is in the `In Review` section in the issue board

## Merging Policy

Before merging a pull request from custom branch to main branch, the following three conditions must be met:
* The pull request must be approved by two reviewers.
* All commits must be squashed before merging.
* The ticket must linked with the pull request

### Important: Squashing Commits 

Always squash your branch's commits using interactive rebase. 

#### Why is this important?

* The main branch would become cluttered with commits otherwise, and this ensures everything remains organized and concise.

#### Example:

`git rebase -i HEAD~<number-of-commits-in-your-custom-branch>`
    
This command will list the commits along with their hashes. You should "pick" the first commit and "squash" the rest. This will merge all your changes into a single commit. 


