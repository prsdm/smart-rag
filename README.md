# SmartRAG 
**SmartRAG** is a simple and powerful tool that lets you interact with both website URLs and document files in one place. It’s built using the [Next.js FastAPI Starter](https://vercel.com/templates/next.js/nextjs-fastapi-starter), a boilerplate that combines **Next.js** with **FastAPI** for a seamless hybrid architecture.

The best feature of **SmartRAG** is that you can interact with both **website URL** and **Document** simultaneously, as demonstrated in the following demo:

https://github.com/user-attachments/assets/e63c3fea-121f-44a1-b923-ab229c9a5236

## How It Works
* The FastAPI server is integrated into the Next.js app under /api/.
* Requests to /api/py/:path* are mapped to the FastAPI server hosted in the /api folder using next.config.js.
* On localhost, FastAPI runs at http://127.0.0.1:8000, and in production, it works as a serverless function hosted on Vercel.
* Both FastAPI and Next.js Route Handlers are available on the same domain, making it easy to handle requests.

## Getting Started
First, clone this repository by using the following command:
```bash
git clone https://github.com/prsdm/smart-rag.git
```
```bash
cd smart-rag
```

After that create and activate a virtual environment (this step is optional):
```bash
python3 -m venv venv
source venv/bin/activate
```

Then, install the dependencies:
```bash
yarn
# or
npm install 
# or
pnpm install
```

Finally, run the development server(python dependencies will be installed automatically here):

```bash
yarn dev
# or
npm run dev 
# or
pnpm dev
```

Open http://localhost:3000 with your browser to see the result.

The FastApi server will be running on http://127.0.0.1:8000 – feel free to change the port in package.json (you'll also need to update it in next.config.js)

## License

Copyright © 2024, [Prasad Mahamulkar](https://github.com/prsdm).

Released under the [MIT License](LICENSE).
