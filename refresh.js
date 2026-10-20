const axios = require('axios');

const GITEE_TOKEN = process.env.GITEE_TOKEN;
const GITEE_OWNER = process.env.GITEE_OWNER;
const GITEE_REPO = process.env.GITEE_REPO;
const GITEE_FILE = process.env.GITEE_FILE;

// 咪咕频道配置，你可以自己增删
const channelList = [
  {name: "CCTV1", id:"cctv1"},
  {name: "CCTV5", id:"cctv5"},
  {name: "咪咕体育", id:"migusports"}
];

async function getMiguPlayUrl(channelId){
  try{
    // 咪咕公开接口获取播放链接
    const res = await axios.get(`https://api.miguvideo.com/mgs/p/v1/channel/getPlayUrl?channelId=${channelId}`);
    return res.data?.data?.playUrl || "";
  }catch(e){
    console.log(channelId + " 获取失败", e.message);
    return "";
  }
}

async function getMiguSource(){
  let lines = "# 咪咕直播源 自动更新\n";
  lines += "# 更新时间：" + new Date().toLocaleString() + "\n";
  for(let ch of channelList){
    const url = await getMiguPlayUrl(ch.id);
    if(url){
      lines += `${url},${ch.name}\n`;
    }
  }
  return lines;
}

async function updateGitee() {
  try {
    const contentText = await getMiguSource();
    const getUrl = `https://gitee.com/api/v5/repos/${GITEE_OWNER}/${GITEE_REPO}/contents/${GITEE_FILE}`;
    const getRes = await axios.get(getUrl, {
      params: { access_token: GITEE_TOKEN }
    });
    const sha = getRes.data.sha;

    await axios.put(getUrl, {
      access_token: GITEE_TOKEN,
      content: Buffer.from(contentText, 'utf8').toString('base64'),
      sha: sha,
      message: '自动更新咪咕直播源'
    });
    console.log("✅ 咪咕源推送成功！");
  } catch (err) {
    console.error("❌ 更新失败：", err.response?.data || err.message);
  }
}

updateGitee();
