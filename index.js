import { postsHost, getPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

// import { postsHost } from "./api.js";
const host = `${postsHost}/`;

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, userId) => {

  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (newPage === USER_POSTS_PAGE) {

      // TODO: реализовать получение постов юзера из API
      // posts = fetch
      // console.log("Открываю страницу пользователя: ", data.userId);
      page = USER_POSTS_PAGE;
      return getPosts({ token: getToken(), userId })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
      // return renderApp();
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

export const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        // TODO: реализовать добавление поста в API
        return fetch(
          host, 
          {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
              description: description
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;"),
              imageUrl: imageUrl,
            }),
            headers: {
                Authorization: getToken(),
            },
          }).then((response) => {
            console.log(response);
            if (response.status === 500) {
            throw new Error(500);
            }  
            
            if (response.status === 400) {
            throw new Error(400);
            }

            if (response.status === 401) {
            throw new Error(401);
            } 
            
            goToPage(POSTS_PAGE);
            
          }).catch((err) => {
            console.log(err);
           if (err.message === '500') {
            return alert('Сервер сломался, попробуй позже')
          } 
          
          if (err.message === 'Failed to fetch') {
            return alert('Кажется, у вас сломался интернет, попробуйте позже')
          } 
          
          if (err.message === '400') {
            return alert('Пожалуйста, загрузите картинку и заполните описание.')
          } 
          
          if (err.message === '401') {
            return alert('Нет авторизации')
          }
          });
        },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    // // TODO: реализовать страницу фотографию пользвателя
    // // Рендер постов пользователя 
    // appEl.innerHTML = "Здесь будет страница фотографий пользователя";
    // return;
    return renderPostsPageComponent({
      appEl
    });
  }
};

goToPage(POSTS_PAGE);


