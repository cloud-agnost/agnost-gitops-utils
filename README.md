# agnost-gitops-utils
Agnost platform oAuth2 and SSL certificate helper utility endpoints.

> Please note that, you do not need to update any part of this util server unless you would like to implement your own authentication and wildcard certificate issue flows.

Agnost uses utils server to facilitate Oauth2 authentication for GitHub, GitLab and Bitbucket and also create the necessary TXT records to issue wildcard certificates. If you would like to use your own authentication solution or would prefer to issue wildcard certificates using your own domain, then you need to update the endpoints in this utils server and customize Agnost studio to call your endpoints.

For how to install, set up and use Agnost please refer to its [documentation](https://agnost.dev/getting-started).