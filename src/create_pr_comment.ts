import * as core from '@actions/core'
import * as github from '@actions/github'
import fs from 'fs';


export async function createPRComment(results:any, options:any, flawInfo:any){

    console.log('Results 0 to work with')
    console.log(results[0])

    //get more information from the flawInfo
    //find the correct flaw info from json inout file
    const resultsFile = fs.readFileSync(flawInfo.resultsFile, 'utf8')
    const data = JSON.parse(resultsFile)
    console.log('Reviewing issueID: '+flawInfo.issuedID)
    const resultArray = data.findings.find((issueId: any) => issueId.issue_id == flawInfo.issuedID)
    const flawWED = resultArray.cwe_id
    const flawSeverity = resultArray.severity
    const issueType = resultArray.issue_type
    const display_text = resultArray.display_text
    const sourceFile = resultArray.files.source_file.file
    const sourceLine = resultArray.files.source_file.line
    const functionName = resultArray.files.source_file.function_name

    //crete comment body
    let commentBody = ''
    commentBody = commentBody+'<pre>Veracode Fix - Fix Suggestions<br>'
    commentBody = commentBody+'Veracode STATIC Finding:<br>'
    commentBody = commentBody+'--------------------------------<br>'
    commentBody = commentBody+'<details><summary>STATIC Finding</summary><p>'
    commentBody = commentBody+'Issue ID: '+flawInfo.issuedID+'<br>'
    commentBody = commentBody+'CWE ID: '+flawWED+'<br>'
    commentBody = commentBody+'Severity: '+flawSeverity+'<br>'
    commentBody = commentBody+'Issue Type: '+issueType+'<br>'
    commentBody = commentBody+'Display Text: '+display_text+'<br>'
    commentBody = commentBody+'Source File: '+sourceFile+'<br>'
    commentBody = commentBody+'Source Line: '+sourceLine+'<br>'
    commentBody = commentBody+'Function Name: '+functionName+'<br>'
    commentBody = commentBody+'</p></details>'
    commentBody = commentBody+'--------------------------------<br>'
    commentBody = commentBody+'DIFF:<br>'
    commentBody = commentBody+'--------------------------------<br>'
    commentBody = commentBody+'<details><summary>Fix Suggestion</summary><p>'
    commentBody = commentBody+results[0]
    commentBody = commentBody+'</p></details>'
    commentBody = commentBody+'--------------------------------<br>'
    commentBody = commentBody+'</pre>'

    console.log('Comment body')
    console.log(commentBody)

    core.info('check if we run on a pull request')
    let pullRequest = process.env.GITHUB_REF
    console.log(pullRequest)
    let isPR:any = pullRequest?.indexOf("pull")

    if ( isPR >= 1 ){
        core.info("This run is part of a PR, should add some PR comment")
        const context = github.context
        const repository:any = process.env.GITHUB_REPOSITORY
        const token = core.getInput("token")
        const repo = repository.split("/");
        const commentID:any = context.payload.pull_request?.number

        

        try {
            const octokit = github.getOctokit(token);

            const { data: comment } = await octokit.rest.issues.createComment({
                owner: repo[0],
                repo: repo[1],
                issue_number: commentID,
                body: commentBody,
            });
            core.info('Adding scan results as comment to PR #'+commentID)
        } catch (error:any) {
            core.info(error);
        }
    }
    else {
        core.info('We are not running on a pull request')
    }

}