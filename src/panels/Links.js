import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import bridge from "@vkontakte/vk-bridge";
import {
	Panel,
	PanelHeader,
	PanelHeaderBack,
	Header,
	Button,
	Group,
	Cell,
	Div,
	Avatar,
} from "@vkontakte/vkui";
import moment  from "moment";;

//Исковый домен
//const findUrl = "oblsud--perm.sudrf.ru"
const findUrl = "livejournal.com"

const Links = ({ id, apiToken, go }) => {

	alert("Началаось выполенние 7");

//	let urlPosts = [];
	const [urlPosts, set_urlPosts] = useState([]);	
	let count = 0;
	let offset = 0;
	let canCall = true;
	let circle; 
	let canEnd = false;
	let curcle_end;

	useEffect(() => {

		function addPosts(data) {
			if (data.response) {
				count += data.response.items.length;
				if (data.response.items.length > 0) {			
					data.response.items.forEach(post =>
						post.attachments.filter(attachment => attachment.type == "link").forEach(attachment =>{
							if (attachment.link.url.includes(findUrl)) urlPosts.push({
								url: attachment.link.url,
								postId: post.id,
								postOwnerId: post.owner_id,
								// неверно приобрзует дату
								postDate:moment(post.date).format("DD.MM.YY")
							})
						})
					);						
					offset += data.response.items.length;
					canCall = true;
				} else {
					alert("Найдено " + String(urlPosts.length) + " / " + String(data.response.count) + " / " + String(count));						
	
	///////////////////////
					set_urlPosts(urlPosts);
	
					clearInterval(circle);
					canEnd = true;
					
				};
			} else {
				// Ошибка
				alert("Ничего не вернулось");
				clearInterval(circle);
				clearInterval(curcle_end);
			};
		}

		function errorPosts(error) {
			alert("Произошла ошибка " + error);
			clearInterval(circle);
			clearInterval(curcle_end);
		}

		async function loadPosts() {
			canCall = false;
			let res = await bridge.send("VKWebAppCallAPIMethod", {

					method: "wall.get",
					params: {
						access_token: apiToken,
//						owner_id: 46573858,
						count: 100,
						offset:offset,
						v: "5.131"
					}
/*	
					method: "wall.search",
					params: {
//						access_token: apiToken,
//то же самое						access_token:  "55576cee55576cee55576ceec9564585165555755576cee315573919885e2be3e78ffbf",
						owner_id: 46573858,
						query: "has:link ", // 98 / 198 / 298 / 398 / 0
//						query: "а", //найдено 49/0/446
						owners_only: 0,
						count: 100,
						offset: offset,
						v: "5.131"
					}
*/
				})
				.then(addPosts)
				.catch(errorPosts);
		}
	
		circle = setInterval(function(){if (canCall) loadPosts();}, 1000);

	}, []);
	
	const openPost = (e) => {
		let postId = Number(e.currentTarget.dataset.postId);
		let postOwnerId = Number(e.currentTarget.dataset.postOwnerId);
		bridge.send("VKWebAppOpenWallPost", { post_id: postId, owner_id: postOwnerId });
	}

//		curcle_end  = setInterval(function(){
//		if (canEnd) {
//			clearInterval(curcle_end);
//			alert("Конец");		
			return (
				<Panel id={id}>
					<PanelHeader left={<PanelHeaderBack onClick={go} data-to="home" />}>
						Ваши посты с опасными ссылками
					</PanelHeader>
					<Group header={<Header>Эти ссылки вы добавляли к своим постам</Header>}>
						{urlPosts.map(link =>
							<Cell
								onClick={openPost} 
								data-post-id={urlPosts.postId}
								data-post-owner-id={urlPosts.postOwnerId}
								description={urlPosts.postDate +  " > " + urlPosts.url}>						
							</Cell>
						)}
					</Group>
				</Panel >
			);
//		};
//	}, 5000);
};

Links.propTypes = {
	id: PropTypes.string.isRequired,
	apiToken: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
}

export default Links;
