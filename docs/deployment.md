# Deployments

Deploy commits to `master` manually to dev and staging environments.

Deployments to production are done manually through Jenkins where a Git tag can be used.

## Deploying to production

1. Post a message into the #data-hub-core-dev channel saying that you want to do a Export Wins UI release and ask if there are any objections. If no objections, proceed with the following steps.

2. Create a GIT tag `git tag v<MAJOR>.<MINOR>.<PATCH>`, e.g. `v3.4.0` pointing to the latest `master`.

   | Release type      | When to increase                                                                         |
   | ----------------- | ---------------------------------------------------------------------------------------- |
   | Major (**1**.0.0) | When a change requires modifications to the infrastructure, e.g. NodeJS version upgrade. |
   | Minor (0.**1**.0) | When a release contains at least one new feature.                                        |
   | Patch (0.0.**1**) | When a release contains only fixes.                                                      |

You can use the [GitHub comparison tool](https://github.com/uktrade/export-wins-ui/compare) to figure out what changes have been made since the last release. You can find out the latest release tag number from [here](https://github.com/uktrade/export-wins-ui/releases).

3. Push the tag to the remote - `git push origin v<VERSION_NUMBER>`.

4. Check that the tag worked by using the [GitHub comparison tool](https://github.com/uktrade/export-wins-ui/compare) again to compare main to the new tag. If done correctly, it should say "main and `v<VERSION_NUMBER>` are identical".

5. Create a GH pre-release by clicking `Draft a new release` on the [releases page](https://github.com/uktrade/export-wins-ui/releases).

The release title should be `v<VERSION_NUMBER>` and release notes can be created by clicking the `Auto-generate release notes` button.

Check that the release notes generated contain what you expect to be deployed to production.

6. Go to Jenkins, find the project `mi-exportwins-ui` and click on `Build with Parameters`.

7. Select `prod` for the environment.

8. Type the `v<VERSION_NUMBER>` created in step `2` into the `Git_Commit` text field.

9. Press the `Build` button.

10. After the Jenkins build has finished, go to Export Wins production and check that everything is working correctly.

11. Change the GitHub pre-release to an actual release.

12. Post the following message on the #data-hub slack channel, making sure to put the actual version number and link the release notes:

```
@here Export Wins UI v<VERSION_NUMBER> is now live!
For more information see the release notes.
```

13. Find the Jenkins project `mi-exportwins-admin` and deploy your tag here as well. You don't need to create a release in GitHub or announce this in Slack.
