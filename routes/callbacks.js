import express from "express";
import githubCallback from "../handlers/githubCallback.js";
import gitlabCallback from "../handlers/gitlabCallback.js";
import bitbucketCallback from "../handlers/bitbucketCallback.js";

const router = express.Router({ mergeParams: true });

/*
@route      /provider/bitbucket/callback
@method     GET
@desc       Callback for Bitbucket OAuth
@access     public
*/
router.get("/bitbucket/callback", bitbucketCallback);

/*
@route      /provider/gitlab/callback
@method     GET
@desc       Callback for GitLab OAuth
@access     public
*/
router.get("/gitlab/callback", gitlabCallback);

/*
@route      /provider/gitlab/callback
@method     GET
@desc       Callback for GitHub OAuth
@access     public
*/
router.get("/github/callback", githubCallback);

export default router;
