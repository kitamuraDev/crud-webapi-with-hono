/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: ['verbose'],
    fileParallelism: false, // ファイル間で並列実行すると、DBのREADでロックがかかってしまうため直列実行するようにする

    // 基本はデフォルトのtrueのままにしておく
    // 本プロジェクトの場合、beforeEachでDBのテーブルリセットを行なっていないため、trueだと更新が走ったタイミングで必ずテストが失敗してしまうため例外的にfalseを設定している経緯がある
    // 一般的にDBが絡むようなテストではbeforeEachでDBのテーブルを都度リセットするのがテストの分離性の観点から好ましいとされている
    watch: false,
  },
});
