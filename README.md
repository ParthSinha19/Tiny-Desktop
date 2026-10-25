# Little Computer Lab

A browser-based mini computer for Years 1–2. Plain HTML, CSS and JavaScript: no frameworks, no build step, no network calls.

## Run locally

Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari). If your browser blocks storage for `file://` pages, serve the folder instead:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Publish on GitHub Pages

1. Create a repository and push every file in this folder (keep the `apps/` folder).
2. In the repository go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute the site appears at `https://<your-username>.github.io/<repository>/`.

## What is inside

| File | Purpose |
| --- | --- |
| `index.html`, `style.css` | Desktop page and all styling |
| `app.js` | Desktop shell: windows, taskbar, Start menu, Bleep, sound, shared dialogs |
| `vfs.js` | One shared virtual file system stored in IndexedDB (plus a tiny event bus) |
| `missions.js` | Weekly missions and the Mission Board app |
| `apps/academy.js` | Week 1: Computer Academy |
| `apps/paint.js` | Week 2: Little Paint |
| `apps/explorer.js` | Week 3: File Explorer |
| `apps/notepad.js` | Opens text files (hidden from the desktop) |
| `icons.js` | Inline SVG icons |

Work is saved in each browser on each computer. Pupils sharing one computer share one set of files. **Start → Start fresh** wipes everything (it asks first).

## Add a new application

1. Create `apps/myapp.js` and call `LCL.registerApp({ id, title, icon, w, h, help, mount(root, ctx) { ... } })`. `mount` fills `root` and may return `{ onOpen, onResize, destroy }`.
2. Add `<script src="apps/myapp.js"></script>` to `index.html`.
3. Use `LCL.vfs` to read and write files, and `LCL.emit('myapp:event')` to report progress.

## Add a weekly mission

Add an object to the `MISSIONS` array in `missions.js`. Each step finishes on an event (`event: 'myapp:event'`) or a file-system `check()`.
