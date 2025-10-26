import { useEffect, useMemo } from 'react';
import { useSongs } from '../stores/useSongs';
import { usePlaylists } from '../stores/usePlaylists';
import type { SongMeta } from '../types';

export default function StatsPage() {
  const { songs, loadSongs } = useSongs();
  const { playlists, loadPlaylists } = usePlaylists();

  useEffect(() => {
    loadSongs();
    loadPlaylists();
  }, [loadSongs, loadPlaylists]);

  const stats = useMemo(() => {
    if (!songs.length && !playlists.length) {
      return null;
    }

    const songCounts = new Map<string, { song: SongMeta; count: number }>();
    
    songs.forEach(song => {
      songCounts.set(song.id, { song, count: 0 });
    });

    playlists.forEach(playlist => {
      playlist.songIds.forEach(songId => {
        const entry = songCounts.get(songId);
        if (entry) {
          entry.count++;
        }
      });
    });

    const topSungSongs = Array.from(songCounts.values())
      .sort((a, b) => b.count - a.count)
      .filter(item => item.count > 0)
      .slice(0, 3);

    const totalSongsInPlaylists = playlists.reduce((sum, pl) => sum + pl.songIds.length, 0);

    const avgSongsPerPlaylist = playlists.length > 0 
      ? totalSongsInPlaylists / playlists.length 
      : 0;

    const longestSong = songs.length > 0
      ? songs.reduce((max, song) => 
          (song.pageCount || 0) > (max.pageCount || 0) ? song : max
        )
      : null;

    const songsWithArtist = songs.filter(s => s.artist);
    const uniqueArtists = new Set(songsWithArtist.map(s => s.artist)).size;

    return {
      totalSongs: songs.length,
      totalPlaylists: playlists.length,
      topSungSongs,
      totalSongsInPlaylists,
      avgSongsPerPlaylist: Math.round(avgSongsPerPlaylist * 10) / 10,
      longestSong,
      songsWithArtist: songsWithArtist.length,
      uniqueArtists,
    };
  }, [songs, playlists]);

  if (!stats) {
    return (
      <div className="relative min-h-full p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-50/30 to-pink-50/20 dark:from-ios-blue/10 dark:via-purple-900/20 dark:to-pink-900/10 pointer-events-none" />
        <div className="relative flex items-center justify-center h-64">
          <p className="text-gray-400">No data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10 pointer-events-none" />
      
      <div className="relative space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-3xl blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
            <div className="inline-block relative mb-2">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl rounded-full -z-10" />
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight pb-1">
                Statistics
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              Overview of your library and playlists
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/10 to-blue-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">
                Songs in Library
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-ios-blue to-blue-600 bg-clip-text text-transparent">
                {stats.totalSongs}
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">
                Total Playlists
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.totalPlaylists}
              </div>
            </div>
          </div>
        </div>

        {/* Top Sung Songs */}
        {stats.topSungSongs.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-purple-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📈</span>
                Top Sung Songs
              </h3>
              <div className="space-y-4">
                {stats.topSungSongs.map((item, index) => (
                  <div key={item.song.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-ios-blue to-purple-600 text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-black dark:text-white truncate">
                          {item.song.title}
                        </div>
                        {item.song.artist && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {item.song.artist}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-ios-blue/10 text-ios-blue rounded-full text-sm font-semibold whitespace-nowrap ml-4">
                      {item.count} playlist{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Playlist Stats */}
        {stats.totalPlaylists > 0 && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🎵</span>
                Playlist Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Total Songs in Playlists</span>
                  <span className="font-bold text-black dark:text-white text-lg">
                    {stats.totalSongsInPlaylists}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Average Songs per Playlist</span>
                  <span className="font-bold text-black dark:text-white text-lg">
                    {stats.avgSongsPerPlaylist}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Song Information */}
        {stats.totalSongs > 0 && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-500/10 blur-xl -z-10" />
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📄</span>
                Song Information
              </h3>
              <div className="space-y-4">
                {stats.longestSong && stats.longestSong.pageCount && stats.longestSong.pageCount > 0 && (
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">
                      Longest Song
                    </div>
                    <div className="font-bold text-xl text-black dark:text-white">
                      {stats.longestSong.title}
                    </div>
                    {stats.longestSong.artist && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {stats.longestSong.artist}
                      </div>
                    )}
                    <div className="inline-block px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-semibold mt-2">
                      {stats.longestSong.pageCount} page{stats.longestSong.pageCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                
                {stats.songsWithArtist > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Songs with Artist Info</span>
                      <span className="font-bold text-black dark:text-white">
                        {stats.songsWithArtist}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Unique Artists</span>
                      <span className="font-bold text-black dark:text-white">
                        {stats.uniqueArtists}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
