function fmtDate(dateStr) {
  var ary = dateStr.split(/\/0?/g)
  return `${ary[0]}/${('00' + ary[1]).slice(-2)}/${('00' + ary[2]).slice(-2)}`
}


// add css
window.addEventListener('DOMContentLoaded', (event) => {
  const cssNode = document.createElement('link')
  cssNode.rel = 'stylesheet'
  cssNode.type = 'text/css'
  cssNode.href = 'https://k1-searchbank.github.io/searchbank-extensions/dist/style.css'
  document.head.appendChild(cssNode)
});


// published at
window.addEventListener('DOMContentLoaded', (event) => {
  console.log('consoleを開いたね？？？\nSearch Bankへようこそ！');

  var publishedNode = document.querySelector('#published-date');
  if (!publishedNode) return;

  var published = fmtDate(publishedNode.content.textContent);
  var updated = fmtDate(document.querySelector('.basicInfo .date').textContent.slice(-10));
  if (!!published && published != updated) document.querySelector('.basicInfo .date').textContent += ` (公開日: ${published})`;
});


// link article
window.addEventListener('DOMContentLoaded', (event) => {
  let loading = false

  const getTimestamp = function() {
    return Math.floor(new Date().getTime() / 1000)
  }

  const safeInnerText = function(node) {
    return !!node ? node.innerText : ''
  }

  const getPost = async function(id) {
    const key = `searchbank-post-${id}`
    const loadPost = function() {
      const url = `/article.php?id=${id}`
      loading = true

      return new Promise(function(resolve, reject) {
        // htmlデータの取得
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.onload = function() {
          if (xhr.status === 200) {
            resolve(xhr.responseText)
          } else {
            reject(new Error(xhr.statusText))
          }
        }
        xhr.onerror = function() {
          reject(new Error(xhr.statusText));
        };
        xhr.send()
      }).then(function(response) {
        const html = new window.DOMParser().parseFromString(response, "text/html")
        const mainNode = html.querySelector('#Main')

        const threeHoursLater = getTimestamp() + (60 * 60 * 3)
        sessionStorage.setItem(key, JSON.stringify({
          id: id,
          url: url,
          title: safeInnerText(mainNode.querySelector('h1')),
          image: html.querySelector('meta[property="og:image"]').getAttribute('content'),
          author: safeInnerText(mainNode.querySelector('.basicInfo .author')),
          publishedAt: safeInnerText(mainNode.querySelector('.basicInfo .date')),
          updatedAt: safeInnerText(html.querySelector('#published-date')),
          expiredTimestamp: threeHoursLater,
        }))

        loading = false
      }).catch(function(e) {
        console.log(e)

        loading = false
        return {}
      })
    }

    let post = JSON.parse(sessionStorage.getItem(key) || '{ "expiredTimestamp": -1 }')
    if (post.expiredTimestamp < getTimestamp()) {
      await loadPost()
      post = JSON.parse(sessionStorage.getItem(key))
    }

    return post
  }

  const buildLinkArticle = async function(node) {
    const post = await getPost(node.dataset.searchbankPostId)

    const imageTag = `<div class="photo"><img src="${post.image}" /></div>`
    const subTag = `<span class="sub">関連記事</span>`
    const titleTag = `<p class="title">${post.title}</p>`
    const authorTag = `<p class="author">${post.author}</p>`
    const dateText = post.publishedAt + (!!post.updatedAt ? ` (公開日: ${post.updatedAt})` : '')
    const dateTag = `<p class="date">${dateText}</p>`

    node.innerHTML = `${imageTag}<div class="txt">${subTag}${titleTag}${authorTag}${dateTag}</div>`
  }

  document
    .querySelectorAll('a.linkArticle[data-searchbank-post-id]')
    .forEach(function(node) {
      buildLinkArticle(node)
    })
});
