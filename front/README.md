# PoST (Poem Smart Translator)

Made by Mitreanu Alexandru & Rotariu George-Flavian.

# Notes

A `css` folder with the compiled `.scss` files is provided for easier evaluation, if need may be, run `sass styles/:css/` in order to compile the `.scss` files to `.css`.

Because the project uses `<script type="module" ... />`, there will be issues regarding the Same-Origin Policy. As such, I highly recommend testing the project with a web server. The simplest way to do so is by using python: `python3 -m http.server 8000` will serve the content on port 8000 of localhost.

Every page can be accessed by exploring the interface, for ease of evaluation, here are the links of all the pages (assuming you ran the python http server as mentioned above):
- http://localhost:8000/pages/add-poem
- http://localhost:8000/pages/dashboard (not accessible through interface alone)
- http://localhost:8000/pages/login
- http://localhost:8000/pages/poem
- http://localhost:8000/pages/profile
- http://localhost:8000/pages/register
- http://localhost:8000/pages/reset-password
- http://localhost:8000/pages

The docs of the application can be found at http://localhost:8000/docs.
