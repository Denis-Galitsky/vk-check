import React, { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";
import {
	View,
	ScreenSpinner,
	AdaptivityProvider,
	AppRoot,
	ConfigProvider,
	SplitLayout,
	SplitCol,
} from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";

import Home from "./panels/Home";
import Links from "./panels/Links";

const App = () => {
	const appId = 51571192;
	const [scheme, setScheme] = useState("bright_light");
	const [activePanel, setActivePanel] = useState("home");
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
	const [apiToken, setApiToken] = useState(null);

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data } }) => {
			if (type === "VKWebAppUpdateConfig") {
				setScheme(data.scheme);
			}
		});

		async function fetchData() {
			const user = await bridge.send("VKWebAppGetUserInfo");
			setUser(user);
			setPopout(null);
		}
		fetchData();

		async function getApiToken() {
			const getAuthTokenRusult = await bridge.send("VKWebAppGetAuthToken", {
				app_id: appId,
				scope: "wall",
			});
			console.log("access_token", getAuthTokenRusult);
			setApiToken(getAuthTokenRusult.access_token);
		}
		getApiToken();
	}, []);

	const go = (e) => {
		setActivePanel(e.currentTarget.dataset.to);
	};

	return (
		<ConfigProvider scheme={scheme}>
			<AdaptivityProvider>
				<AppRoot>
					<SplitLayout popout={popout}>
						<SplitCol>
							<View activePanel={activePanel}>
								<Home id="home" fetchedUser={fetchedUser} go={go} />
								<Links id="links" apiToken={apiToken} go={go} />
							</View>
						</SplitCol>
					</SplitLayout>
				</AppRoot>
			</AdaptivityProvider>
		</ConfigProvider>
	);
};

export default App;
