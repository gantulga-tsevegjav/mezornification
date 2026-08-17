# Matrix CTF - Next.js / AWS Amplify

Converted from the original static/Vercel implementation without changing the visible UI flow.

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set a long random `CTF_SECRET`. `WHITE_RABBIT_PASSWORD` defaults to `sushi` only for local compatibility; set it explicitly in Amplify environment variables.

## AWS Amplify Hosting

1. Push this directory to GitHub/GitLab/Bitbucket.
2. Amplify Hosting -> Create new app -> connect the repository and branch.
3. Add environment variables `CTF_SECRET` and `WHITE_RABBIT_PASSWORD`.
4. Amplify will build with `npm run build`; `amplify.yml` publishes `.next`.

## Security change

Credential pool and login validation run only on the server. A random HttpOnly session ID selects the same credential pair deterministically for the session. The Matrix animation requests the selected secret only when it is about to render it, so credentials are no longer embedded in the JS source bundle. Oracle/reveal values are also server endpoints.
