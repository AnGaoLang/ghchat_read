// 延迟多少时间后在 then 里执行
export default function sleep(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
