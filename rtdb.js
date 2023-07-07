import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
	import { getDatabase, ref, child, get, update } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";

	const firebaseConfig = {
		apiKey: "AIzaSyA2vVGK5q7CCIogSzjWmS3W1dwXWIaNx54",
		authDomain: "arlokastu.firebaseapp.com",
		databaseURL: "https://arlokastu-default-rtdb.asia-southeast1.firebasedatabase.app",
		projectId: "arlokastu",
		storageBucket: "arlokastu.appspot.com",
		messagingSenderId: "380938305623",
		appId: "1:380938305623:web:7e29194c2b17940611e312",
	};

	const app = initializeApp(firebaseConfig),
		db = getDatabase();

	const gsLink = sessionStorage.getItem("_shortL");
	if (gsLink) {
		let d = JSON.parse(gsLink),
			dUrl = `stu/${d.by}/${d.id}/`;

		const gOri = await get(child(ref(db), dUrl + "ori"))
			.then((e) => (e.exists() ? e.val() == d.ori : !1))
			.catch(() => !1);

		if (gOri) {
			let cpcUser = await get(child(ref(db), `userLevel/${d.by}/level`))
				.then((e) => e.exists() && e.val())
				.catch(() => !1);
			cpcUser && (cpcUser = await get(child(ref(db), `config/stu/level/${cpcUser}/cpc`)).then((c) => (c.exists() ? c.val() : 1)));

			const gCpc = await get(child(ref(db), "config/stu/cpc")).then((e) => (e.exists() ? e.val() : 1));
			const cpc = cpcUser ? cpcUser : gCpc;
			// console.info("cpc: ", cpc);

			const gClick = await get(child(ref(db), dUrl + "click"))
				.then((e) => (e.exists() ? e.val() + 1 : 1))
				.catch(() => 1);

			const date = new Date(),
				year = date.getFullYear(),
				month = String(date.getMonth() + 1).padStart(2, "0"),
				day = String(date.getDate()).padStart(2, "0"),
				ym = [year, month].join("-");

			const gReport = await get(child(ref(db), `/reports/${d.by}/${ym}/${day}`))
				.then((e) => {
					let v = e.val();
					return { click: v.click + 1, cpc: (v.click * v.cpc + cpc) / (v.click + 1) };
				})
				.catch(() => {
					return { click: 1, cpc };
				});

			const gBalance = await get(child(ref(db), `/balance/${d.by}/current`))
				.then((e) => e.val() + cpc)
				.catch(() => cpc);

			const dataUpd = {};

			dataUpd["/" + dUrl + "click"] = gClick;
			dataUpd[`/reports/${d.by}/${ym}/${day}/click`] = gReport.click;
			dataUpd[`/reports/${d.by}/${ym}/${day}/cpc`] = gReport.cpc;
			dataUpd[`/balance/${d.by}/current`] = gBalance;

			console.info(dataUpd);

			document.querySelectorAll(".icdbx").forEach((e) => {
				e.addEventListener("click", () => {
					if (stVC()) {
						update(ref(db), dataUpd)
							.then(() => alert("Data successfully updated.."))
							.catch((e) => e.message);
					}
				});
			});
		}
	}
