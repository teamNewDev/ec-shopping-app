if(!self.define){let e,i={};const s=(s,c)=>(s=new URL(s+".js",c).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(c,n)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(i[r])return;let o={};const f=e=>s(e,r),t={module:{uri:r},exports:o,require:f};i[r]=Promise.all(c.map((e=>t[e]||f(e)))).then((e=>(n(...e),o)))}}define(["./workbox-c29a8bcf"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/icon-192.png",revision:"5794a986c718814fef46bcf6599f3e13"},{url:"assets/icon-384.png",revision:"0f22cac9c181968c0af42cd6a95372db"},{url:"assets/icon-512.png",revision:"9046850343c7ecb95d2f71f0f720a60b"},{url:"dexie.min.js",revision:"284616c5481a9d805e9c82c243e8d3f4"},{url:"index.css",revision:"50cebacb3bae3fff0c252b7c67d3f530"},{url:"index.html",revision:"7042a703f72ca9a52a8bf79a15669b08"},{url:"index.js",revision:"142fec3edf948a1cf22dec544d43205d"},{url:"line-awesome.css",revision:"382ce6aaa6ed9b4f1c1d98cf91752dcb"},{url:"manifest.json",revision:"e68f4ab3ddca40b8d626deba197c1389"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]})}));
//# sourceMappingURL=sw.js.map
