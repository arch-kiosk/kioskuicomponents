import { defineConfig, searchForWorkspaceRoot, loadEnv } from "vite";
import license from "rollup-plugin-license";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";

// noinspection JSUnusedGlobalSymbols
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, "env");
    return {
        plugins: [
            createHtmlPlugin({
                inject: {
                    ...env,
                },

            }),
            license({
                sourcemap: true,
                cwd: process.cwd(), // The default

                banner: {
                    commentStyle: "regular", // The default

                    content: {
                        file: path.join(__dirname, "LICENSE"),
                        encoding: "utf-8", // Default is utf-8
                    },

                    // Optional, may be an object or a function returning an object.
                    // data() {
                    //     return {
                    //         foo: 'foo',
                    //     };
                    // },
                },

                thirdParty: {
                    includePrivate: true, // Default is false.
                    includeSelf: false, // Default is false.
                    multipleVersions: false, // Default is false.

                    output: {
                        file: path.join(__dirname, "dist", "dependencies.txt"),
                        encoding: "utf-8", // Default is utf-8.

                    },
                },
            }),
            // copy({
            //   targets: [ { src: '../../kioskfilemakerworkstationplugin/static/kioskfilemakerworkstation.css',
            //     dest:'./kioskfilemakerworkstation/static'
            //   }, {
            //     src: '../../kioskfilemakerworkstationplugin/static/scripts',
            //     dest:'./kioskfilemakerworkstation/static'
            //   }],
            //   hook: 'buildStart'
            // }),
        ],

        esbuild:
            command == "build"
                ? {
                    //No console.logs in the distribution
                    // drop: ["console", "debugger"],
                }
                : {},
        build: {
            outDir: "./dist",
            minify: true,
            lib: {
                entry: "./kioskuicomponents.ts",
                formats: ["es"],
            },
            rollupOptions: {
                // external: [/^dexie/]
                //   // external: [/^lit/, /@vaadin.*/]
            },
            // rollupOptions: {
            // }
        },
        server: {
            hmr: false,
            host: true,
            proxy: {

                // '/foo': 'http://localhost:4567',
                "/static/assets/images": {
                    target: "http://localhost:5000",
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on("error", (err, _req, _res) => {
                            console.log("proxy error", err);
                        });
                        proxy.on("proxyReq", (_proxyReq, req, _res) => {
                            console.log("Sending Request to the Target:", req.method, req.url);
                        });
                        proxy.on("proxyRes", (proxyRes, req, _res) => {
                            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
                        });
                    }

                },
                "/api": {
                    target: "http://localhost:5000",
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on("error", (err, _req, _res) => {
                            console.log("proxy error", err);
                        });
                        proxy.on("proxyReq", (_proxyReq, req, _res) => {
                            console.log("Sending Request to the Target:", req.method, req.url);
                        });
                        proxy.on("proxyRes", (proxyRes, req, _res) => {
                            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
                        });
                    },
                },
                "/static": {
                    target: "http://localhost:5000",
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on("error", (err, _req, _res) => {
                            console.log("proxy error", err);
                        });
                        proxy.on("proxyReq", (_proxyReq, req, _res) => {
                            console.log("Sending Request to the Target:", req.method, req.url);
                        });
                        proxy.on("proxyRes", (proxyRes, req, _res) => {
                            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
                        });
                    },
                },
            },
            fs: {
                strict: true,
                allow: [searchForWorkspaceRoot(process.cwd()), "../../../static/scripts/kioskapplib"],
            },
        },
        publicDir: "/public",
    };
});
