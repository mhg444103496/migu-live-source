const axios = require('axios');

const GITEE_TOKEN = process.env.GITEE_TOKEN;
const GITEE_OWNER = process.env.GITEE_OWNER;
const GITEE_REPO = process.env.GITEE_REPO;
const GITEE_FILE = process.env.GITEE_FILE;

// 频道列表，你可以继续增减
const channelList = [
  {name: "CCTV1", cid: "31"},
  {name: "CCTV5", cid: "35"},
  {name: "CCTV6", cid: "36"},
  {name: "CCTV8", cid: "38"},
  {name: "咪咕体育", cid: "10000000000000000001"}
];

async function getPlay(cid) {
  try {
    const dt = Date.now();
    const res = await axios({
      method:"GET",
      url:`https://live.miguvideo.com/mgs/live/v2/stream/get?cid=${cid}&type=1&_t=${dt}`,
      headers:{
        "User-Agent":"Mozilla/5.0"
      },
      timeout:8000
    })
    const url = res.data?.data?.streamUrl;
    return url || "";
  } catch (e) {
    console.log(cid,"获取失败",e.message);
    return "";
  }
}

async function buildSource(){
  let txt = "#咪咕直播源 自动更新\n";
  txt += "#更新时间：" + new Date().toLocaleString() + "\n";
  for(let ch of channelList){
    const url = await getPlay(ch.cid);
    if(url){
      txt += `${url},${ch.name}\n`
    }
  }
  return txt;
}

async function updateGitee() {
  try {
    const contentText = await buildSource();
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
    console.log("✅ 更新成功");
  } catch (err) {
    console.error("❌ 更新失败：", err.response?.data || err.message);
  }
}

updateGitee();
