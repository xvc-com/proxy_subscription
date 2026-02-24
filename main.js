#!/usr/bin/env bun

import loads from "@3-/yml/loads.js";
import dumps from "@3-/yml/dumps.js";
import SUB from "./conf/SUB.js";
import S3 from "./conf/S3.js";
import ossput from "@3-/ossput";
import BANED from "./BANED.js";

const SUBSCRIPTION_USERINFO = "subscription-userinfo";

const put = ossput(S3),
  _fetchProxy = async (name, url, user_agent, suffix, conv) => {
    const req = await fetch(url, {
        headers: {
          "User-Agent": user_agent,
        },
      }),
      subscription_userinfo = req.headers.get(SUBSCRIPTION_USERINFO),
      meta = {
        Key: name + suffix,
      };

    let txt = (await req.text()).replaceAll("赔钱", "盈");
    if (subscription_userinfo) {
      meta.Metadata = {
        "subscription-userinfo": subscription_userinfo,
      };
    }
    if (conv) {
      txt = conv(txt, meta);
    }
    await put(
      meta,
      () => {
        return txt;
      },
      "text/js",
    );
  },
  fetchProxy = async (...args) => {
    try {
      return await _fetchProxy(...args);
    } catch (e) {
      console.error(args[0], e);
    }
  };

await Promise.allSettled(
  Object.entries(SUB).map(async ([name, url]) => {
    console.log(name);
    await fetchProxy(name, url, "Clash Verge Rev/2.4.0", "", (yml, meta) => {
      yml = loads(yml);
      const { name } = yml["proxy-groups"][0],
        exist = new Set(yml.rules);
      meta.ContentDisposition = `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;
      for (const host of BANED) {
        const rule = "DOMAIN-SUFFIX," + host + "," + name;
        if (!exist.has(rule)) {
          console.log(rule);
          yml.rules.unshift(rule);
        }
      }
      return dumps(yml);
    });
    await fetchProxy(name, url, "", ".b64");
  }),
);
