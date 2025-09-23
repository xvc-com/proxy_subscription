#!/usr/bin/env bun

import SUB from "./conf/SUB.js";
import S3 from "./conf/S3.js";
import ossput from "@3-/ossput";

const put = ossput(S3),
	_fetchProxy = async (name, url, user_agent, suffix) => {
		const txt = await (
			await fetch(url, {
				headers: {
					"User-Agent": user_agent,
				},
			})
		).text();
		await put(
			name + suffix,
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
		await fetchProxy(name, url, "Clash Verge Rev/2.4.0", "");
		await fetchProxy(name, url, "", ".b64");
	}),
);
