'use strict';

const q = require('qunit');
const { client, moduleHooks, tracks } = require('./test_context');

q.module('browser api', moduleHooks);

q.test('query player', async assert =>
{
    await client.addPlaylistItems(0, [tracks.t3]);

    await client.play(0, 0);
    await client.waitForState(s => {
        return s.playbackState === 'playing';
    });

    await client.pause();
    await client.waitForState(s => {
        return s.playbackState === 'paused';
    });

    const columns = ['%title%'];
    const player = await client.getPlayerState(columns);
    const result = await client.query({ player: true, trcolumns: columns });

    assert.deepEqual(result.player, player);
});

q.test('query playlists', async assert =>
{
    await client.addPlaylist({ title: 'My playlist' });

    const playlists = await client.getPlaylists();
    const result = await client.query({ playlists: true });

    assert.deepEqual(result.playlists, playlists);
});

q.test('query playlist items', async assert =>
{
    await client.addPlaylistItems(0, [tracks.t2, tracks.t3]);

    const columns = ['%title%'];
    const playlistItems = await client.getPlaylistItems(0, columns);

    const result = await client.query({
        playlistItems: true,
        plref: 0,
        plrange: '0:100',
        plcolumns: columns,
    });

    assert.deepEqual(result.playlistItems, playlistItems);
});

q.test('query all', async assert =>
{
    await client.addPlaylistItems(0, [tracks.t2, tracks.t3]);

    await client.play(0, 0);
    await client.waitForState(s => {
        return s.playbackState === 'playing';
    });

    await client.pause();
    await client.waitForState(s => {
        return s.playbackState === 'paused';
    });

    await client.addPlaylist({ title: 'My playlist' });

    const columns = ['%title%'];

    const expected = {
        player: await client.getPlayerState(columns),
        playlists: await client.getPlaylists(),
        playlistItems: await client.getPlaylistItems(0, columns),
    };

    const result = await client.query({
        player: true,
        trcolumns: columns,
        playlists: true,
        playlistItems: true,
        plref: 0,
        plrange: '0:100',
        plcolumns: columns,
    });

    assert.deepEqual(result, expected);
});

q.test('expect player events', async assert =>
{
    await client.addPlaylistItems(0, [tracks.t1]);

    const expectation = client.expectEvent(
        { player: true }, e => e.player === true);

    await expectation.ready;
    await client.play(0, 0);
    await expectation.done;

    assert.ok(true);
});

q.test('expect playlist events', async assert =>
{
    const expectation = client.expectEvent(
        { playlists: true }, e => e.playlists === true);

    await expectation.ready;
    await client.addPlaylist();
    await expectation.done;

    assert.ok(true);
});

q.test('expect playlist items events', async assert =>
{
    const expectation = client.expectEvent(
        { playlistItems: true }, e => e.playlistItems === true);

    await expectation.ready;
    await client.addPlaylistItems(0, [tracks.t1]);
    await expectation.done;

    assert.ok(true);
});