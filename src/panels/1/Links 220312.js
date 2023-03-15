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

const findUrl = "livejournal.com"
//oblsud--perm.sudrf.ru


const Links = ({ id, apiToken, go }) => {
	//const MAXPOSTLENGTH = 300;
	//const [posts, setPosts] = useState([]);
	//const [links, setLinks] = useState([]);
	// const [showLinksFrom, setShowLinksFrom] = useState(null);
	//Перенёс	
	alert("Началаось выполенние 3");
	
	let urlPosts = [];	
	let count = 0;
	let offset = 0;
	let next = true;
	let called = false;

	while (next) {
		if (called) {
			alert ("Ждём...");
//			sleep(10);
		} else {
			called = true;
			alert ("Запускаем...");
			const res = await bridge.send("VKWebAppCallAPIMethod", {
					method: "wall.search",
					params: {
						access_token: apiToken,
						count: 100,
						query: "has:link ",
						owners_only: 0,
						count: 30,
						offset:offset,
						v: "5.131"
					}
				});
			res.then((data) => {
		    		if (data.response) {
					// Обработка события в случае успеха
					count = data.response.items.length;
					if (count > 0) {			
						let posts = data.response.items;
						posts.forEach(post =>
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
						alert("Найдено " + String(urlPosts.length) + " / " + String(count));						
						offset = offset + count;
						alert("1 called " + called + " next " + next);
					} else {
						alert("возвращено НОЛЬ");						
						nextc = false;
					};
				} else {
					// Ошибка
					alert("Произошла ошибка");
					next = false;
	    			};
				called = false;
				alert("2 called " + called + " next " + next);
			});
			res.catch((error) => {
				// Обработка события в случае ошибки
				alert("Произошла ошибка " + error);
				called = false;
				next = false;					
			});
//			await res;
		};

		alert("3 called " + called + " next " + next);

	};

	alert("Всего " + String(urlPosts.length) + " / " + String(offset));



	const openPost = (e) => {
		let postId = Number(e.currentTarget.dataset.postId);
		let postOwnerId = Number(e.currentTarget.dataset.postOwnerId);
		bridge.send("VKWebAppOpenWallPost", { post_id: postId, owner_id: postOwnerId });
	}


	return (
		<Panel id={id}>
			<PanelHeader left={<PanelHeaderBack onClick={go} data-to="home" />}>
				Ваши посты с опасными ссылками
			</PanelHeader>
			{/* {showRepostsFrom ? renderPosts() : null} */}
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
};

Links.propTypes = {
	id: PropTypes.string.isRequired,
	apiToken: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
}

export default Links;
