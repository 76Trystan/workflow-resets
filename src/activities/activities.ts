function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function activity1() { await sleep(1000); return "result-1"; }
export async function activity2() { await sleep(1000); return "result-2"; }
export async function activity3() { await sleep(1000); return "result-3"; }
export async function activity4() { await sleep(1000); return "result-4"; }
export async function activity5() { await sleep(1000); return "result-5"; }
export async function activity6() { await sleep(1000); return "result-6"; }
export async function activity7() { await sleep(1000); return "result-7"; }
export async function activity8() { await sleep(1000); return "result-8"; }
export async function activity9() { await sleep(1000); return "result-9"; }
export async function activity10() { await sleep(1000); return "result-10"; }
