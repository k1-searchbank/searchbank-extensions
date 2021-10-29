function fmtDate(dateStr) {
  var ary = dateStr.split(/\/0?/g)
  return `${ary[0]}/${('00' + ary[1]).slice(-2)}/${('00' + ary[2]).slice(-2)}`
}


// published at
window.addEventListener('DOMContentLoaded', (event) => {
  console.log('consoleを開いたね？？？\nSearch Bankへようこそ！');

  var publishedNode = document.querySelector('#published-date');
  if (!publishedNode) return;

  var published = fmtDate(publishedNode.content.textContent);
  var updated = fmtDate(document.querySelector('.basicInfo .date').textContent.slice(-10));
  if (!!published && published != updated) document.querySelector('.basicInfo .date').textContent += ` (公開日: ${published})`;
});
