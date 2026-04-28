const http = require("http");
const { existsSync, readFileSync } = require("fs");
const { extname, join } = require("path");

const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const PORT = process.env.PORT || 3000;
const HOST = "127.0.0.1";
const routes = [...userRoutes, ...serviceRoutes, ...bookingRoutes];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-role",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 8 * 1024 * 1024) {
        reject(new Error("Payload too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

function matchRoute(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".jsx": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  };

  return types[ext] || "application/octet-stream";
}

function serveStatic(res, pathname) {
  const staticRoots = [join(__dirname, "..", "public"), join(__dirname, "..")];
  const requestedPath = pathname === "/" ? "/public/index.html" : pathname;

  for (const root of staticRoots) {
    const candidate = join(root, requestedPath.replace(/^\//, ""));
    if (existsSync(candidate)) {
      res.writeHead(200, { "Content-Type": getMimeType(candidate) });
      res.end(readFileSync(candidate));
      return true;
    }
  }

  if (pathname === "/") {
    const fallback = join(__dirname, "..", "public", "index.html");
    res.writeHead(200, { "Content-Type": getMimeType(fallback) });
    res.end(readFileSync(fallback));
    return true;
  }

  return false;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const matchedRoute = routes.find((route) => route.method === req.method && matchRoute(route.path, url.pathname));

  if (matchedRoute) {
    try {
      const params = matchRoute(matchedRoute.path, url.pathname);
      const body = ["POST", "PUT"].includes(req.method) ? await parseBody(req) : {};
      await matchedRoute.handler({
        req,
        res,
        params,
        query: Object.fromEntries(url.searchParams.entries()),
        body,
        sendJson: (status, payload) => sendJson(res, status, payload),
        sendError: (status, message) => sendError(res, status, message)
      });
      return;
    } catch (error) {
      sendError(res, 400, error.message);
      return;
    }
  }

  if (!serveStatic(res, url.pathname)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function startServer() {
  const server = http.createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

module.exports = {
  startServer
};
