# -*- coding: utf-8 -*-
"""Translate the premium-nudge template pool (batch 2)."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES = os.path.join(ROOT, "src", "i18n", "locales")

DATA = {
    "ja": {
        "ms-streak-5": ["5日連続 — もう習慣です 🌟", "多くの人は2日目を越えられません。プレミアムはねぎらいの気持ちです：テーマ、マルチモニター、そしてBlink Eyeをみんなに無料で届け続けること。", "Blink Eyeを支援"],
        "ms-streak-10": ["2桁到達：{streak}日！ 🎉", "{streak}日、意識して視線をずらしてきた。その規律は、プレミアムによってあなたの連続を支えるオープンソースプロジェクトへの応援になります。", "Blink Eyeを支援"],
        "ms-streak-30": ["{streak}日。丸一ヶ月、目にやさしい日々を 🏆", "丸一ヶ月、自分に向き合ってきた。プレミアム会員は、これから1日目を始める人にも無料を届けています。", "Blink Eyeを支援してプレミアムを解放"],
        "ms-club-50": ["{totalBreaks}回の完全な休憩 💛", "50回クラブです — {totalBreaks}回、画面よりも自分の目を選びました。プレミアムがこのクラブを続けさせます。", "Blink Eyeを支援"],
        "ms-club-100": ["{totalBreaks}回の休憩。3桁です！ 🌟", "100回、意識して立ち止まった。Blink Eyeは無料でオープンソース — プレミアムがそれを守ります。", "Blink Eyeを支援してプレミアムを解放"],
        "ms-club-250": ["{totalBreaks}回の休憩。伝説の域です 🏆", "{totalBreaks}回の完全な休憩に届く人はほとんどいません。このプロジェクトがあるのはあなたのおかげです — プレミアムはお礼の気持ちです。", "Blink Eyeを支援"],
        "te-streak-1": ["見てください、{streak}日連続 🎉", "本物の習慣が育ちつつあります。{daysLeftNote} プレミアムで道具箱を鋭く保てます — テーマ、マルチモニターなど。", "プレミアムを見る"],
        "te-streak-2": ["{streak}日連続 — 目が感謝しています", "その調子。{daysLeftNote} プレミアムに移るとBlink Eyeを応援でき、すべてが解放されます。", "プレミアムを見る"],
        "te-cum-1": ["{totalBreaks}回の休憩 💛", "{totalBreaks}回、自分の目を選んできました。{daysLeftNote} プレミアムがBlink Eyeをみんなに無料で届け続けます。", "プレミアムを見る"],
        "te-cum-2": ["{totalBreaks}回も向き合ってきました", "その一貫性には道具箱全体がふさわしい。{daysLeftNote} テーマ、マルチモニター、そして感謝を込めて。", "Blink Eyeを支援"],
        "te-rel-1": ["今日の画面時間は{screenHours}時間", "それでも視線をずらしました。それがすべて。{daysLeftNote} プレミアムが私たちを続けさせます。", "プレミアムを見る"],
        "te-fb-1": ["お試し期間もすぐ終わりです", "この日々をありがとうございました。{daysLeftNote} Blink Eyeは無料でオープンソース — プレミアムがそれを守ります。", "プレミアムを見る"],
        "te-fb-2": ["お試し終了前のひとこと", "圧力はありません、感謝だけです。{daysLeftNote} もしBlink Eyeが目に役立ったなら、プレミアムはそのお礼の方法です。", "Blink Eyeを支援"],
        "ex-streak-1": ["{streak}日連続、さらに伸びています 🎉", "お試しは終わりましたが、習慣は終わらなくて大丈夫。Blink Eyeを支援してプレミアム特典を解放しましょう。", "Blink Eyeを支援"],
        "ex-streak-2": ["{streak}日、目に向き合ってきました", "その連続はお試しの有無にかかわらずあなたのもの。プレミアムがその背後のプロジェクトを生かし続けます。", "Blink Eyeを支援してプレミアムを解放"],
        "ex-cum-1": ["{totalBreaks}回の休憩 — ここまでの道のりを見てください 💛", "ひとつひとつが未来の自分への贈りもの。プレミアムはその贈りものを、あなたにもみんなにも届け続けます。", "Blink Eyeを支援"],
        "ex-cum-2": ["{totalBreaks}回の本物の休憩を取ってきました", "そんな風に言える人は多くありません。テーマとマルチモニターを解放し、Blink Eyeをみんなに無料で。", "プレミアムを見る"],
        "ex-rel-1": ["今日は画面の前に{screenHours}時間", "視線をずらすように誰かが気遣ってくれてよかった。その誰かはプレミアムの支援で動いています。", "Blink Eyeを支援"],
        "ex-fb-1": ["お試しは終わりました — 休憩は終わらなくて大丈夫", "Blink Eyeはお試しの有無にかかわらず無料のまま。プレミアムは特典を解放し、プロジェクトを応援します。", "Blink Eyeを支援"],
        "ex-fb-2": ["まだここにいて、まだまばたきしています 💛", "これからの（よく休んだ）目にとっての1日目。プレミアムは必要なときにそこにあります。", "プレミアムを見る"],
        "wb-streak-1": ["{streak}日連続 — 気づいていました 🎉", "ここであなたがいなかったことを感じていました。プレミアムは必要なときにあなたのもの — そしてBlink Eyeを無料に保ちます。", "プレミアムを見る"],
        "wb-streak-2": ["その{streak}日連続、によく合っています", "道具箱全体に戻りましょう：テーマ、マルチモニター、そしてオープンソースを応援する温かい気持ちを。", "Blink Eyeを支援"],
        "wb-cum-1": ["{totalBreaks}回の休憩、さらに伸びています 💛", "ずっと続けてきましたね — 敬意を。プレミアムはお礼を言う方法です。", "Blink Eyeを支援"],
        "wb-cum-2": ["最初の休憩を覚えていますか？", "あれから{totalBreaks}回取りました。プレミアムが次の{totalBreaks}回を届けます — あなたにとって、無料で。", "プレミアムを見る"],
        "wb-rel-1": ["今日の画面時間は{screenHours}時間 — いつも通り", "変わらないものもあって、だから私たちはまだここにいます。プレミアムが私たちをここに置いてくれます。", "Blink Eyeを支援"],
        "wb-fb-1": ["しばらくまばたきしていませんでしたね 💛", "Blink Eyeはまだ無料、まだオープンソース、まだ気遣っています。プレミアムがそれを守ります。", "プレミアムを見る"],
        "wb-fb-2": ["お茶が入りました", "腰を落として本物の休憩を。プレミアム特典は必要なときに待っています。", "Blink Eyeを支援"],
    },
    "zh-CN": {
        "ms-streak-5": ["连续 5 天 — 这已经是习惯了 🌟", "大多数人连第二天都坚持不了。高级版是我们回敬的击掌：主题、多显示器，以及让 Blink Eye 对所有人免费。", "支持 Blink Eye"],
        "ms-streak-10": ["两位数：{streak} 天！🎉", "{streak} 天，一次次有意识地把目光移开。这就是自律。升级高级版可以支持你这段连续背后那个开源项目。", "支持 Blink Eye"],
        "ms-streak-30": ["{streak} 天。整整一个月，善待双眼 🏆", "整整一个月都在照顾自己。高级会员让下一个从第一天开始的人也能继续免费使用。", "支持 Blink Eye 并解锁高级版"],
        "ms-club-50": ["一起完成了 {totalBreaks} 次完整休息 💛", "这就是 50 次休息俱乐部 — {totalBreaks} 次你选择了眼睛而不是屏幕。高级版让这个俱乐部继续运转。", "支持 Blink Eye"],
        "ms-club-100": ["{totalBreaks} 次休息。三位数！🌟", "一百次你主动停下来。Blink Eye 是免费且开源的 — 高级版让它保持这样。", "支持 Blink Eye 并解锁高级版"],
        "ms-club-250": ["{totalBreaks} 次休息。传说级别 🏆", "很少有人能达到 {totalBreaks} 次完整休息。这个项目存在的意义就是你 — 高级版是心意。", "支持 Blink Eye"],
        "te-streak-1": ["看看你，连续 {streak} 天 🎉", "一个真正的习惯正在形成。{daysLeftNote} 高级版让你的工具箱保持锋利 — 主题、多显示器等等。", "查看高级版"],
        "te-streak-2": ["连续 {streak} 天 — 你的眼睛谢谢你", "继续保持。{daysLeftNote} 升级高级版支持 Blink Eye，并解锁全部功能。", "查看高级版"],
        "te-cum-1": ["一起 {totalBreaks} 次休息 💛", "这是你 {totalBreaks} 次选择了眼睛。{daysLeftNote} 高级版让 Blink Eye 对所有人免费。", "查看高级版"],
        "te-cum-2": ["你已经做到了 {totalBreaks} 次", "这样的坚持值得完整的工具箱。{daysLeftNote} 主题、多显示器，以及我们的感谢。", "支持 Blink Eye"],
        "te-rel-1": ["今天屏幕时间 {screenHours} 小时", "但你还是把目光移开了。这就是全部意义。{daysLeftNote} 高级版帮助我们继续下去。", "查看高级版"],
        "te-fb-1": ["你的试用期快结束了", "感谢你这些日子的陪伴。{daysLeftNote} Blink Eye 是免费且开源的 — 高级版让它保持这样。", "查看高级版"],
        "te-fb-2": ["试用期结束前的一句提醒", "没有压力，只有感谢。{daysLeftNote} 如果 Blink Eye 帮到了你的眼睛，高级版就是你回馈的方式。", "支持 Blink Eye"],
        "ex-streak-1": ["连续 {streak} 天，还在继续 🎉", "试用期结束了，但你的习惯不必结束。支持 Blink Eye 以解锁高级版特权。", "支持 Blink Eye"],
        "ex-streak-2": ["{streak} 天，坚持照顾你的眼睛", "无论有没有试用，这段连续都属于你。高级版让它背后的项目继续活下去。", "支持 Blink Eye 并解锁高级版"],
        "ex-cum-1": ["{totalBreaks} 次休息 — 看看你走了多远 💛", "每一次都是送给你未来自己的礼物。高级版让礼物继续送出，给你，也给所有人。", "支持 Blink Eye"],
        "ex-cum-2": ["你已经做了 {totalBreaks} 次真正的休息", "很少有人能这样说。解锁主题和多显示器 — 并让 Blink Eye 对所有人免费。", "查看高级版"],
        "ex-rel-1": ["今天在屏幕前 {screenHours} 小时", "幸好有人提醒你把目光移开。那个人靠高级版支持运行。", "支持 Blink Eye"],
        "ex-fb-1": ["试用期结束了 — 你的休息不必结束", "无论有没有试用，Blink Eye 都保持免费。高级版只是解锁特权并支持项目。", "支持 Blink Eye"],
        "ex-fb-2": ["还在这里，还在眨眼 💛", "在（休息充分的）双眼的余生里，这是第一天。高级版随时在你想要时出现。", "查看高级版"],
        "wb-streak-1": ["连续 {streak} 天 — 我们注意到了 🎉", "我们在这里想念你。高级版随时属于你 — 并让 Blink Eye 保持免费。", "查看高级版"],
        "wb-streak-2": ["这段 {streak} 天的连续很适合你", "回到完整的工具箱：主题、多显示器，以及支持开源的温暖感觉。", "支持 Blink Eye"],
        "wb-cum-1": ["{totalBreaks} 次休息，还在继续 💛", "你坚持这件事已经有一阵子了 — 敬佩。高级版是我们表达感谢的方式。", "支持 Blink Eye"],
        "wb-cum-2": ["还记得你的第一次休息吗？", "从那时起你已经做了 {totalBreaks} 次。高级版让接下来的 {totalBreaks} 次继续到来 — 给你，并且免费。", "查看高级版"],
        "wb-rel-1": ["今天 {screenHours} 小时屏幕时间 — 一如既往", "有些事情永远不会改变，这也是我们仍在这里的原因。高级版让我们留在这里。", "支持 Blink Eye"],
        "wb-fb-1": ["好久没有眨眼了 💛", "Blink Eye 仍然免费、仍然开源、仍然提醒你。高级版是你让它保持这样的方式。", "查看高级版"],
        "wb-fb-2": ["水烧开了", "坐下来好好休息一下。高级版特权随时等你。", "支持 Blink Eye"],
    },
    "zh-TW": {
        "ms-streak-5": ["連續 5 天 — 這已經是習慣了 🌟", "大多數人連第二天都堅持不了。進階版是我們回敬的擊掌：主題、多螢幕，以及讓 Blink Eye 對所有人免費。", "支持 Blink Eye"],
        "ms-streak-10": ["兩位數：{streak} 天！🎉", "{streak} 天，一次次有意識地把目光移開。這就是自律。升級進階版可以支持你這段連續背後那個開源專案。", "支持 Blink Eye"],
        "ms-streak-30": ["{streak} 天。整整一個月，善待雙眼 🏆", "整整一個月都在照顧自己。進階會員讓下一個從第一天開始的人也能繼續免費使用。", "支持 Blink Eye 並解鎖進階版"],
        "ms-club-50": ["一起完成了 {totalBreaks} 次完整休息 💛", "這就是 50 次休息俱樂部 — {totalBreaks} 次你選擇了眼睛而不是螢幕。進階版讓這個俱樂部繼續運轉。", "支持 Blink Eye"],
        "ms-club-100": ["{totalBreaks} 次休息。三位數！🌟", "一百次你主動停下來。Blink Eye 是免費且開源的 — 進階版讓它保持這樣。", "支持 Blink Eye 並解鎖進階版"],
        "ms-club-250": ["{totalBreaks} 次休息。傳說級別 🏆", "很少有人能達到 {totalBreaks} 次完整休息。這個專案存在的意義就是你 — 進階版是心意。", "支持 Blink Eye"],
        "te-streak-1": ["看看你，連續 {streak} 天 🎉", "一個真正的習慣正在形成。{daysLeftNote} 進階版讓你的工具箱保持鋒利 — 主題、多螢幕等等。", "查看進階版"],
        "te-streak-2": ["連續 {streak} 天 — 你的眼睛謝謝你", "繼續保持。{daysLeftNote} 升級進階版支持 Blink Eye，並解鎖全部功能。", "查看進階版"],
        "te-cum-1": ["一起 {totalBreaks} 次休息 💛", "這是你 {totalBreaks} 次選擇了眼睛。{daysLeftNote} 進階版讓 Blink Eye 對所有人免費。", "查看進階版"],
        "te-cum-2": ["你已經做到了 {totalBreaks} 次", "這樣的堅持值得完整的工具箱。{daysLeftNote} 主題、多螢幕，以及我們的感謝。", "支持 Blink Eye"],
        "te-rel-1": ["今天螢幕時間 {screenHours} 小時", "但你還是把目光移開了。這就是全部意義。{daysLeftNote} 進階版幫助我們繼續下去。", "查看進階版"],
        "te-fb-1": ["你的試用期快結束了", "感謝你這些日子的陪伴。{daysLeftNote} Blink Eye 是免費且開源的 — 進階版讓它保持這樣。", "查看進階版"],
        "te-fb-2": ["試用期結束前的一句提醒", "沒有壓力，只有感謝。{daysLeftNote} 如果 Blink Eye 幫到了你的眼睛，進階版就是你回饋的方式。", "支持 Blink Eye"],
        "ex-streak-1": ["連續 {streak} 天，還在繼續 🎉", "試用期結束了，但你的習慣不必結束。支持 Blink Eye 以解鎖進階版特權。", "支持 Blink Eye"],
        "ex-streak-2": ["{streak} 天，堅持照顧你的眼睛", "無論有沒有試用，這段連續都屬於你。進階版讓它背後的專案繼續活下去。", "支持 Blink Eye 並解鎖進階版"],
        "ex-cum-1": ["{totalBreaks} 次休息 — 看看你走了多遠 💛", "每一次都是送給你未來自己的禮物。進階版讓禮物繼續送出，給你，也給所有人。", "支持 Blink Eye"],
        "ex-cum-2": ["你已經做了 {totalBreaks} 次真正的休息", "很少有人能這樣說。解鎖主題和多螢幕 — 並讓 Blink Eye 對所有人免費。", "查看進階版"],
        "ex-rel-1": ["今天在螢幕前 {screenHours} 小時", "幸好有人提醒你把目光移開。那個人靠進階版支持運行。", "支持 Blink Eye"],
        "ex-fb-1": ["試用期結束了 — 你的休息不必結束", "無論有沒有試用，Blink Eye 都保持免費。進階版只是解鎖特權並支持專案。", "支持 Blink Eye"],
        "ex-fb-2": ["還在這裡，還在眨眼 💛", "在（休息充分的）雙眼的餘生裡，這是第一天。進階版隨時在你想要時出現。", "查看進階版"],
        "wb-streak-1": ["連續 {streak} 天 — 我們注意到了 🎉", "我們在這裡想念你。進階版隨時屬於你 — 並讓 Blink Eye 保持免費。", "查看進階版"],
        "wb-streak-2": ["這段 {streak} 天的連續很適合你", "回到完整的工具箱：主題、多螢幕，以及支持開源的溫暖感覺。", "支持 Blink Eye"],
        "wb-cum-1": ["{totalBreaks} 次休息，還在繼續 💛", "你堅持這件事已經有一陣子了 — 敬佩。進階版是我們表達感謝的方式。", "支持 Blink Eye"],
        "wb-cum-2": ["還記得你的第一次休息嗎？", "從那時起你已經做了 {totalBreaks} 次。進階版讓接下來的 {totalBreaks} 次繼續到來 — 給你，並且免費。", "查看進階版"],
        "wb-rel-1": ["今天 {screenHours} 小時螢幕時間 — 一如既往", "有些事情永遠不會改變，這也是我們仍在這裡的原因。進階版讓我們留在這裡。", "支持 Blink Eye"],
        "wb-fb-1": ["好久沒有眨眼了 💛", "Blink Eye 仍然免費、仍然開源、仍然提醒你。進階版是你讓它保持這樣的方式。", "查看進階版"],
        "wb-fb-2": ["水燒開了", "坐下來好好休息一下。進階版特權隨時等你。", "支持 Blink Eye"],
    },
    "zh": {
        "ms-streak-5": ["连续 5 天 — 这已经是习惯了 🌟", "大多数人连第二天都坚持不了。高级版是我们回敬的击掌：主题、多显示器，以及让 Blink Eye 对所有人免费。", "支持 Blink Eye"],
        "ms-streak-10": ["两位数：{streak} 天！🎉", "{streak} 天，一次次有意识地把目光移开。这就是自律。升级高级版可以支持你这段连续背后那个开源项目。", "支持 Blink Eye"],
        "ms-streak-30": ["{streak} 天。整整一个月，善待双眼 🏆", "整整一个月都在照顾自己。高级会员让下一个从第一天开始的人也能继续免费使用。", "支持 Blink Eye 并解锁高级版"],
        "ms-club-50": ["一起完成了 {totalBreaks} 次完整休息 💛", "这就是 50 次休息俱乐部 — {totalBreaks} 次你选择了眼睛而不是屏幕。高级版让这个俱乐部继续运转。", "支持 Blink Eye"],
        "ms-club-100": ["{totalBreaks} 次休息。三位数！🌟", "一百次你主动停下来。Blink Eye 是免费且开源的 — 高级版让它保持这样。", "支持 Blink Eye 并解锁高级版"],
        "ms-club-250": ["{totalBreaks} 次休息。传说级别 🏆", "很少有人能达到 {totalBreaks} 次完整休息。这个项目存在的意义就是你 — 高级版是心意。", "支持 Blink Eye"],
        "te-streak-1": ["看看你，连续 {streak} 天 🎉", "一个真正的习惯正在形成。{daysLeftNote} 高级版让你的工具箱保持锋利 — 主题、多显示器等等。", "查看高级版"],
        "te-streak-2": ["连续 {streak} 天 — 你的眼睛谢谢你", "继续保持。{daysLeftNote} 升级高级版支持 Blink Eye，并解锁全部功能。", "查看高级版"],
        "te-cum-1": ["一起 {totalBreaks} 次休息 💛", "这是你 {totalBreaks} 次选择了眼睛。{daysLeftNote} 高级版让 Blink Eye 对所有人免费。", "查看高级版"],
        "te-cum-2": ["你已经做到了 {totalBreaks} 次", "这样的坚持值得完整的工具箱。{daysLeftNote} 主题、多显示器，以及我们的感谢。", "支持 Blink Eye"],
        "te-rel-1": ["今天屏幕时间 {screenHours} 小时", "但你还是把目光移开了。这就是全部意义。{daysLeftNote} 高级版帮助我们继续下去。", "查看高级版"],
        "te-fb-1": ["你的试用期快结束了", "感谢你这些日子的陪伴。{daysLeftNote} Blink Eye 是免费且开源的 — 高级版让它保持这样。", "查看高级版"],
        "te-fb-2": ["试用期结束前的一句提醒", "没有压力，只有感谢。{daysLeftNote} 如果 Blink Eye 帮到了你的眼睛，高级版就是你回馈的方式。", "支持 Blink Eye"],
        "ex-streak-1": ["连续 {streak} 天，还在继续 🎉", "试用期结束了，但你的习惯不必结束。支持 Blink Eye 以解锁高级版特权。", "支持 Blink Eye"],
        "ex-streak-2": ["{streak} 天，坚持照顾你的眼睛", "无论有没有试用，这段连续都属于你。高级版让它背后的项目继续活下去。", "支持 Blink Eye 并解锁高级版"],
        "ex-cum-1": ["{totalBreaks} 次休息 — 看看你走了多远 💛", "每一次都是送给你未来自己的礼物。高级版让礼物继续送出，给你，也给所有人。", "支持 Blink Eye"],
        "ex-cum-2": ["你已经做了 {totalBreaks} 次真正的休息", "很少有人能这样说。解锁主题和多显示器 — 并让 Blink Eye 对所有人免费。", "查看高级版"],
        "ex-rel-1": ["今天在屏幕前 {screenHours} 小时", "幸好有人提醒你把目光移开。那个人靠高级版支持运行。", "支持 Blink Eye"],
        "ex-fb-1": ["试用期结束了 — 你的休息不必结束", "无论有没有试用，Blink Eye 都保持免费。高级版只是解锁特权并支持项目。", "支持 Blink Eye"],
        "ex-fb-2": ["还在这里，还在眨眼 💛", "在（休息充分的）双眼的余生里，这是第一天。高级版随时在你想要时出现。", "查看高级版"],
        "wb-streak-1": ["连续 {streak} 天 — 我们注意到了 🎉", "我们在这里想念你。高级版随时属于你 — 并让 Blink Eye 保持免费。", "查看高级版"],
        "wb-streak-2": ["这段 {streak} 天的连续很适合你", "回到完整的工具箱：主题、多显示器，以及支持开源的温暖感觉。", "支持 Blink Eye"],
        "wb-cum-1": ["{totalBreaks} 次休息，还在继续 💛", "你坚持这件事已经有一阵子了 — 敬佩。高级版是我们表达感谢的方式。", "支持 Blink Eye"],
        "wb-cum-2": ["还记得你的第一次休息吗？", "从那时起你已经做了 {totalBreaks} 次。高级版让接下来的 {totalBreaks} 次继续到来 — 给你，并且免费。", "查看高级版"],
        "wb-rel-1": ["今天 {screenHours} 小时屏幕时间 — 一如既往", "有些事情永远不会改变，这也是我们仍在这里的原因。高级版让我们留在这里。", "支持 Blink Eye"],
        "wb-fb-1": ["好久没有眨眼了 💛", "Blink Eye 仍然免费、仍然开源、仍然提醒你。高级版是你让它保持这样的方式。", "查看高级版"],
        "wb-fb-2": ["水烧开了", "坐下来好好休息一下。高级版特权随时等你。", "支持 Blink Eye"],
    },
}


def apply(code, templates):
    path = os.path.join(LOCALES, f"{code}.json")
    data = json.load(open(path, encoding="utf-8"))
    nudge = data.setdefault("nudge", {})
    bucket = nudge.setdefault("templates", {})
    for tid, (headline, body, cta) in templates.items():
        bucket[tid] = {"headline": headline, "body": body, "cta": cta}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("updated", code, len(bucket), "templates")


for code, templates in DATA.items():
    apply(code, templates)
