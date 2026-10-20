const axios = require('axios');

const GITEE_TOKEN = process.env.GITEE_TOKEN;
const GITEE_OWNER = process.env.GITEE_OWNER;
const GITEE_REPO = process.env.GITEE_REPO;
const GITEE_FILE = process.env.GITEE_FILE;

// ========== 这里后续你可以换成咪咕实时抓取的频道内容，先用来测试推送 ==========
async function getMiguSource() {
  // 测试内容，先保证能成功推送到gitee的live.txt
  let txt = `#咪咕直播源自动更新测试
#更新时间：${new Date().toLocaleString()}
CCTV-1,http://example.com/test1
CCTV-5,http://example.com/test2
咪咕体育,http://example.com/test3
`;
  return txt;
}

async function updateGitee() {
  try {
    const contentText = await getMiguSource();
    // 获取文件sha
    const getUrl = `https://gitee.com/api/v5/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/${GITEE_FILE}`;
    const getRes = await axios.get(getUrl, {
      params: { access_token: GITEE_TOKEN }
    });
    const sha = getRes.data.sha;

    // 提交更新
    const putRes = await axios.put(getUrl, {
      access_token: GITEE_TOKEN,
      content: Buffer.from(contentText, 'utf8').toString('base64'),
      sha: sha,
      message: '自动更新直播源'
    });
    console.log("✅ 推送成功！", putRes.data.html_url);
  } catch (err) {
    console.error("❌ 更新失败：");
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

updateGitee();
