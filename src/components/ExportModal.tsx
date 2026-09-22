import React, { useState } from 'react';
import { StudioProject } from '../types.ts';
import {
  X,
  Copy,
  Check,
  Download,
  Code,
  FileJson,
  Share2,
  Layers,
  Smartphone,
  Globe,
  Database,
  Apple,
  Info,
} from 'lucide-react';

export type ExportProfileId = 'raw' | 'web' | 'android' | 'ios';

interface ExportProfileOption {
  id: ExportProfileId;
  name: string;
  badge: string;
  description: string;
}

const EXPORT_PROFILES: ExportProfileOption[] = [
  {
    id: 'raw',
    name: 'Raw / Source',
    badge: 'Master',
    description: 'Full-resolution unprocessed assets, original audio & master JSON manifest',
  },
  {
    id: 'web',
    name: 'Web',
    badge: 'Flat PNG/WebP',
    description: 'Flat PNG/WebP browser-optimized assets with drop-in React and HTML embeds',
  },
  {
    id: 'android',
    name: 'Android',
    badge: 'Density Buckets',
    description: 'Density-bucketed (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi), vector drawable & Compose code',
  },
  {
    id: 'ios',
    name: 'iOS (Stub)',
    badge: '@1x/@2x/@3x',
    description: 'Stub catalog shaped for Xcode .xcassets scale variants (not implemented yet)',
  },
];

interface ExportModalProps {
  project: StudioProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [selectedProfile, setSelectedProfile] = useState<ExportProfileId>('raw');
  const [activeTab, setActiveTab] = useState<'primary_code' | 'secondary_code' | 'json'>('primary_code');
  const [copied, setCopied] = useState(false);

  // Helper safe slug
  const projectSlug = project.title.toLowerCase().replace(/\s+/g, '_');

  // React Web Snippet
  const reactSnippet = `// AppIntroScene.tsx - Ready to drop into your React / Next.js / Vite app!
import React, { useState, useEffect } from 'react';

export const AppIntroScene: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const [speaking, setSpeaking] = useState(true);

  useEffect(() => {
    ${project.voiceAudioUrl ? `const audio = new Audio('${project.voiceAudioUrl.slice(0, 80)}...'); audio.play();` : `// Trigger custom voiceover audio here`}
    const timer = setTimeout(() => {
      setSpeaking(false);
      if (onFinish) onFinish();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg aspect-video sm:aspect-auto sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        {/* Background Image */}
        <img
          src="${project.backgroundUrl}"
          alt="App Intro"
          className="absolute inset-0 w-full h-full object-cover animate-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Avatar Figure (${project.avatarStyle}) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className={\`w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-400 \${speaking ? 'animate-bounce' : ''}\`}>
            <img src="${project.avatarUrl}" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Subtitles */}
        <div className="absolute bottom-4 inset-x-4 z-20 text-center">
          <div className="inline-block px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs">
            "${project.dialogueText.replace(/"/g, '\\"')}"
          </div>
        </div>
      </div>
    </div>
  );
};`;

  // HTML / Web Snippet
  const htmlSnippet = `<!-- Embed Code for App Intro Cutscene -->
<div id="app-intro-container" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;">
  <div style="position:relative;width:340px;height:580px;border-radius:32px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
    <img src="${project.backgroundUrl}" style="width:100%;height:100%;object-fit:cover;" />
    <div style="position:absolute;bottom:70px;left:50%;transform:translateX(-50%);width:96px;height:96px;border-radius:50%;border:2px solid #818cf8;overflow:hidden;">
      <img src="${project.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />
    </div>
    <div style="position:absolute;bottom:20px;left:16px;right:16px;text-align:center;background:rgba(0,0,0,0.6);padding:8px;border-radius:16px;color:#fff;font-size:12px;font-family:sans-serif;">
      ${project.dialogueText}
    </div>
  </div>
</div>`;

  // Android Jetpack Compose Snippet
  const androidComposeSnippet = `// AvatarIntroScreen.kt - Jetpack Compose implementation for Android
package com.avatarstudios.app.ui

import android.media.MediaPlayer
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.avatarstudios.app.R

@Composable
fun AvatarIntroScreen(onFinish: () -> Unit) {
    val context = LocalContext.current
    var isPlaying by remember { mutableStateOf(true) }

    DisposableEffect(Unit) {
        val mediaPlayer = MediaPlayer.create(context, R.raw.${projectSlug}_voice).apply {
            setOnCompletionListener {
                isPlaying = false
                onFinish()
            }
            start()
        }
        onDispose { mediaPlayer.release() }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF070A12))
    ) {
        // Density-bucketed background loaded from res/drawable
        Image(
            painter = painterResource(id = R.drawable.${projectSlug}_backdrop),
            contentDescription = "Scene Backdrop",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Gradient Scrim
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color(0xCC000000), Color(0xF0000000))
                    )
                )
        )

        // Avatar Figure (${project.framing || 'bust_portrait'} - ${project.avatarStyle})
        Image(
            painter = painterResource(id = R.drawable.${projectSlug}_avatar),
            contentDescription = "Avatar Character",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 120.dp)
                .fillMaxHeight(0.65f)
        )

        // Subtitle dialogue card
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 24.dp, vertical = 32.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xDD0F172A))
                .padding(16.dp)
        ) {
            Text(
                text = "${project.dialogueText.replace(/"/g, '\\"')}",
                color = Color.White,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
        }
    }
}`;

  // Android Vector Drawable XML Template
  const androidVectorDrawableSnippet = `<!-- res/drawable/${projectSlug}_avatar_vector.xml -->
<!-- Vector Drawable template for scalable Android UI art & icon overlays -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="200dp"
    android:height="200dp"
    android:viewportWidth="200"
    android:viewportHeight="200">
    <path
        android:fillColor="#4F46E5"
        android:pathData="M100,20 C144.18,20 180,55.82 180,100 C180,144.18 144.18,180 100,180 C55.82,180 20,144.18 20,100 C20,55.82 55.82,20 100,20 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M80,75 C80,63.95 88.95,55 100,55 C111.05,55 120,63.95 120,75 C120,86.05 111.05,95 100,95 C88.95,95 80,86.05 80,75 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M60,145 C60,122.91 77.91,105 100,105 C122.09,105 140,122.91 140,145 L60,145 Z" />
</vector>`;

  // iOS SwiftUI Stub Snippet
  const iosSwiftUiStub = `// AvatarIntroView.swift - iOS SwiftUI (Stub shaped for Xcode Asset Catalog)
// Note: iOS export is currently a stub. Asset references follow @1x/@2x/@3x conventions.
import SwiftUI
import AVFoundation

struct AvatarIntroView: View {
    var onFinish: (() -> Void)?
    @State private var audioPlayer: AVAudioPlayer?

    var body: some View {
        ZStack {
            // Background from Assets.xcassets
            Image("${projectSlug}_backdrop")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .ignoresSafeArea()

            LinearGradient(
                colors: [.clear, .black.opacity(0.85)],
                startPoint: .center,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            // Avatar Figure (@1x/@2x/@3x in Assets.xcassets)
            VStack {
                Spacer()
                Image("${projectSlug}_avatar")
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 480)
                
                // Dialogue bubble
                Text("${project.dialogueText.replace(/"/g, '\\"')}")
                    .font(.footnote)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.black.opacity(0.75))
                    .cornerRadius(16)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
            }
        }
    }
}`;

  // iOS Contents.json Stub
  const iosContentsJsonStub = `{
  "images": [
    {
      "idiom": "universal",
      "scale": "1x",
      "filename": "${projectSlug}_avatar@1x.png"
    },
    {
      "idiom": "universal",
      "scale": "2x",
      "filename": "${projectSlug}_avatar@2x.png"
    },
    {
      "idiom": "universal",
      "scale": "3x",
      "filename": "${projectSlug}_avatar@3x.png"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}`;

  // Profile-dependent JSON Manifest
  const getJsonManifest = () => {
    switch (selectedProfile) {
      case 'android':
        return JSON.stringify(
          {
            profile: 'android',
            schemaVersion: '2.0.0',
            title: project.title,
            targetSystem: 'Android (API 26+)',
            densityBuckets: {
              mdpi: { scaleMultiplier: '1.0x', baselineDpi: 160, folder: 'res/drawable-mdpi/' },
              hdpi: { scaleMultiplier: '1.5x', baselineDpi: 240, folder: 'res/drawable-hdpi/' },
              xhdpi: { scaleMultiplier: '2.0x', baselineDpi: 320, folder: 'res/drawable-xhdpi/' },
              xxhdpi: { scaleMultiplier: '3.0x', baselineDpi: 480, folder: 'res/drawable-xxhdpi/' },
              xxxhdpi: { scaleMultiplier: '4.0x', baselineDpi: 640, folder: 'res/drawable-xxxhdpi/' },
            },
            resourceMapping: {
              avatar: {
                resourceName: `${projectSlug}_avatar`,
                format: 'png',
                densityVariants: ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'],
                sourceUrl: project.avatarUrl,
                style: project.avatarStyle,
                framing: project.framing || 'bust_portrait',
              },
              backdrop: {
                resourceName: `${projectSlug}_backdrop`,
                format: 'png',
                densityVariants: ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'],
                sourceUrl: project.backgroundUrl,
              },
              vectorDrawable: {
                resourceName: `${projectSlug}_avatar_vector`,
                folder: 'res/drawable/',
                format: 'xml',
                feasible: true,
              },
              audioRaw: {
                resourceName: `${projectSlug}_voice`,
                folder: 'res/raw/',
                format: 'wav',
                sourceUrl: project.modulatedAudioUrl || project.voiceAudioUrl,
              },
            },
            dialogue: {
              script: project.dialogueText,
              voiceActor: project.selectedVoice,
              emotion: project.speechEmotion,
            },
            exportTimestamp: new Date().toISOString(),
          },
          null,
          2
        );

      case 'ios':
        return JSON.stringify(
          {
            profile: 'ios',
            schemaVersion: '2.0.0-stub',
            title: project.title,
            targetSystem: 'iOS (Xcode Asset Catalog)',
            status: 'stub_only',
            note: 'Shaped for upcoming Xcode asset catalog export. Not fully implemented in this pass.',
            assetCatalog: {
              name: `${projectSlug}.xcassets`,
              imagesets: [
                {
                  name: `${projectSlug}_avatar.imageset`,
                  scaleVariants: ['@1x', '@2x', '@3x'],
                  format: 'png',
                },
                {
                  name: `${projectSlug}_backdrop.imageset`,
                  scaleVariants: ['@1x', '@2x', '@3x'],
                  format: 'png',
                },
              ],
            },
            exportTimestamp: new Date().toISOString(),
          },
          null,
          2
        );

      case 'web':
        return JSON.stringify(
          {
            profile: 'web',
            schemaVersion: '2.0.0',
            title: project.title,
            targetSystem: 'Web / SPA (React, Vue, HTML5)',
            assets: {
              avatar: {
                url: project.avatarUrl,
                format: 'webp/png',
                style: project.avatarStyle,
                framing: project.framing,
              },
              backdrop: {
                url: project.backgroundUrl,
                format: 'webp/png',
                aspectRatio: project.backgroundAspect,
              },
              audio: {
                url: project.modulatedAudioUrl || project.voiceAudioUrl,
                format: 'audio/wav',
              },
            },
            exportTimestamp: new Date().toISOString(),
          },
          null,
          2
        );

      case 'raw':
      default:
        return JSON.stringify(
          {
            profile: 'raw',
            schemaVersion: '1.0.0',
            title: project.title,
            appType: project.appType,
            assets: {
              background: {
                url: project.backgroundUrl,
                mode: project.backgroundMode,
                resolution: project.backgroundSize,
                aspectRatio: project.backgroundAspect,
                animation: project.backgroundAnimation,
              },
              avatar: {
                url: project.avatarUrl,
                mode: project.avatarMode,
                resolution: project.avatarSize,
                pose: project.avatarPose,
                style: project.avatarStyle,
              },
              voiceover: {
                actor: project.selectedVoice,
                emotion: project.speechEmotion,
                dialogue: project.dialogueText,
                hasAudioPayload: !!project.voiceAudioUrl,
                audioMimeType: 'audio/wav',
              },
              soundtrack: {
                trackId: project.musicTrackId,
                musicVolume: project.musicVolume,
                voiceVolume: project.voiceVolume,
              },
            },
            exportTimestamp: new Date().toISOString(),
          },
          null,
          2
        );
    }
  };

  const getCurrentSnippet = () => {
    if (activeTab === 'json') {
      return getJsonManifest();
    }

    if (selectedProfile === 'android') {
      return activeTab === 'primary_code' ? androidComposeSnippet : androidVectorDrawableSnippet;
    }

    if (selectedProfile === 'ios') {
      return activeTab === 'primary_code' ? iosSwiftUiStub : iosContentsJsonStub;
    }

    // raw or web
    return activeTab === 'primary_code' ? reactSnippet : htmlSnippet;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const manifest = getJsonManifest();
    const blob = new Blob([manifest], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectSlug}-${selectedProfile}-manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Export &amp; In-App Integration</h3>
              <p className="text-[11px] text-slate-400">
                Select an export profile to format code and assets for your specific deployment platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Selector Banner */}
        <div className="p-3.5 bg-slate-950/90 border-b border-slate-800">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Export Target Profile:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPORT_PROFILES.map((prof) => {
              const isSelected = selectedProfile === prof.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => setSelectedProfile(prof.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {prof.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {prof.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {prof.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Details Bar */}
        {selectedProfile === 'android' && (
          <div className="px-4 py-2 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Android Profile Active: density buckets configured for mdpi (1x), hdpi (1.5x), xhdpi (2x), xxhdpi (3x), xxxhdpi (4x)
            </span>
            <span className="text-[10px] font-mono bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-200 border border-emerald-700/50">
              Jetpack Compose Ready
            </span>
          </div>
        )}

        {selectedProfile === 'ios' && (
          <div className="px-4 py-2 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              iOS Profile is currently a stub: shaped for Xcode Assets.xcassets @1x/@2x/@3x scale variants
            </span>
            <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded text-amber-200 border border-amber-700/50">
              Stub Only
            </span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('primary_code')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'primary_code'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              {selectedProfile === 'android'
                ? 'Jetpack Compose (Kotlin)'
                : selectedProfile === 'ios'
                ? 'SwiftUI (Swift Stub)'
                : 'React Component'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('secondary_code')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'secondary_code'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {selectedProfile === 'android'
                ? 'Vector Drawable (XML)'
                : selectedProfile === 'ios'
                ? 'Contents.json (@1x/@2x/@3x)'
                : 'HTML / Web Embed'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              Manifest JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'json' && (
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                Download JSON
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/90">
          <pre className="whitespace-pre-wrap selection:bg-indigo-600/40">
            {getCurrentSnippet()}
          </pre>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Active Profile: <strong className="text-slate-200">{selectedProfile.toUpperCase()}</strong> • Per-export selectable system
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
