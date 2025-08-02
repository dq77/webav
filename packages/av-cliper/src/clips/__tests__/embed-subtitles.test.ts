import { expect, test } from 'vitest';
import { EmbedSubtitlesClip } from '../embed-subtitles-clip';

const txt1 = `

1
00:00:00,341 --> 00:00:03,218
测试样本1-3s

2
00:00:04,386 --> 00:00:07,555
超长的测试样本1，超长的测试样本1，超长的测试样本1，超长的测试样本1，超长的测试样本1，超长的测试样本1
超长的测试样本2，超长的测试样本2，超长的测试样本2，超长的测试样本2，超长的测试样本2，超长的测试样本2

3
00:00:07,265 --> 00:00:10,766
测试样本3-3s

4
00:00:10,850 --> 00:00:15,143
测试样本4-5s

5
00:00:16,685 --> 00:00:26,186
测试样本5-10s

6
00:00:17,270 --> 00:00:37,604
测试样本6-10s

7
00:00:38,688 --> 00:00:48,606
测试样本7-10

8
00:00:49,690 --> 00:01:10,691
测试样本8-10s

9
00:01:11,774 --> 00:01:30,026
测试样本9-20s

`;

test('EmbedSubtitles', async () => {
  const es = new EmbedSubtitlesClip(txt1, {
    videoWidth: 1280,
    videoHeight: 720,
  });
  const vf0 = (await es.tick(0)).video;
  // 第一个字幕还未显示出来
  expect(vf0?.timestamp).toBe(0);
  expect(vf0?.duration).toBe(341000);

  const vf1 = (await es.tick(342000)).video;
  // 显示第一个字幕
  expect(vf1?.timestamp).toBe(342000);
  expect(vf1?.duration).toBe(3218000 - 342000);

  // 100s 超出字幕时间
  const { state } = await es.tick(100 * 1e6);
  expect(state).toBe('done');
});

const txt2 = `
1
00:00:00,341 --> 00:00:03,218
111
测试样本1-3s

`;
test('EmbedSubtitles digital', async () => {
  const es = new EmbedSubtitlesClip(txt2, {
    videoWidth: 1280,
    videoHeight: 720,
  });
  const vf1 = (await es.tick(342000)).video;
  // 显示第一个字幕
  expect(vf1?.timestamp).toBe(342000);
  expect(vf1?.duration).toBe(3218000 - 342000);
});

test('split by time', async () => {
  const clip = new EmbedSubtitlesClip(txt1, {
    videoWidth: 1280,
    videoHeight: 720,
  });
  await clip.ready;
  const [preClip, postClip] = await clip.split(30e6);
  expect(clip.meta.duration).toBe(
    preClip.meta.duration + postClip.meta.duration,
  );
});

test('EmbedSubtitles with font styles', async () => {
  const es = new EmbedSubtitlesClip(txt2, {
    videoWidth: 1280,
    videoHeight: 720,
    fontWeight: 'bold',
    fontStyle: 'italic',
  });

  // Check if the clip is created successfully
  expect(es).toBeDefined();

  const vf1 = (await es.tick(342000)).video;
  expect(vf1?.timestamp).toBe(342000);
  expect(vf1?.duration).toBe(3218000 - 342000);
});

test('EmbedSubtitles with numeric font weight', async () => {
  const es = new EmbedSubtitlesClip(txt2, {
    videoWidth: 1280,
    videoHeight: 720,
    fontWeight: 700, // Bold weight
    fontStyle: 'normal',
  });

  expect(es).toBeDefined();

  const vf1 = (await es.tick(342000)).video;
  expect(vf1?.timestamp).toBe(342000);
  expect(vf1?.duration).toBe(3218000 - 342000);
});
