import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { page, posts, goToPage, renderApp, user } from "../index.js";
import { addLike, removeLike } from "../api.js";
import { format } from "date-fns";

export function renderPostsPageComponent({ appEl }) {

  if (posts) {
    const postHtml = posts.map((post, index) => {
      let textLikes = 0;
      if (post.likes.length) {
        textLikes = post.likes[Object.keys(post.likes)[0]].name;
        if (post.likes.length > 1) {
          textLikes = textLikes.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;") + ' и еще ' + post.likes.length;
        }
      };
      return `<li class="post">
      ${(page === POSTS_PAGE) ? (`<div class="post-header">
        <img src="${post.user.imageUrl}" class="post-header__user-image user-link" data-userid="${post.user.id}">
        <p class="post-header__user-name user-link" data-userid="${post.user.id}">${post.user.name.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")}</p>
      </div>`) : ``}

      <div class="post-image-container">
        <img class="post-image" src="${post.imageUrl}">
      </div>
      <div class="post-likes">
        <button data-postid="${post.id}" data-index="${index}" class="like-button${post.isLiked ? ' active-like' : ''}">
          <img src="./assets/images/like-${post.isLiked ? '' : 'not-'}active.svg">
        </button>
        <p class="post-likes-text">
          Нравится: <strong>${textLikes}</strong>
        </p>
      </div>
      <p class="post-text">
        <span class="user-name">${post.user.name}</span>
        ${post.description}
      </p>
      <p class="post-date">
        ${post.createdAt}
      </p>
    </li>`
    }).join('');

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <ul class="posts">
          ${postHtml}
        </ul>
      </div>`;
  
    appEl.innerHTML = appHtml;

    if (page === POSTS_PAGE)
      document.querySelectorAll(".user-link").forEach((el) => {
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          goToPage(USER_POSTS_PAGE, { userId: el.dataset.userid })
        })
      })
  } else {
    const originHtml = `
      <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        "постов нет"
      </ul>
      </div>
      `;

    appEl.innerHTML = originHtml;
  }

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  const addLikeButtonElements = document.querySelectorAll('.like-button');

  for (const addLikeButtonElement of addLikeButtonElements) {

    addLikeButtonElement.addEventListener('click', (e) => {
      const postIdImage = addLikeButtonElement.dataset.postid
      const index = addLikeButtonElement.dataset.index

      if (user) {
        if(posts[index].isLiked) {
          removeLike(postIdImage).then((updatedPost) => {
            posts[index].isLiked = false;
            posts[index].likes = updatedPost.post.likes;
            renderApp();
          })
        } else {
          addLike(postIdImage).then((updatedPost) => {
            posts[index].isLiked = true;
            posts[index].likes = updatedPost.post.likes;
            renderApp();
          })
        }
      } else {
        alert("Необходимо авторизоваться");
      }
    })
  } 
}
