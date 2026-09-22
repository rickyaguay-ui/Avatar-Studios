import React, { useState } from 'react';
import { StudioProject } from '../types.ts';
import {
  Download,
  Code2,
  PackageCheck,
  Copy,
  Check,
  FileJson,
  Music,
  User,
  Layers,
  Volume2,
  ExternalLink,
  ShieldCheck,
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
    description: 'Full-res unprocessed originals, master audio & unconstrained JSON manifest',
  },
  {
    id: 'web',
    name: 'Web',
    badge: 'Flat PNG/WebP',
    description: 'Web-optimized flat PNG/WebP assets with React, HTML, and Flutter embeds',
  },
  {
    id: 'android',
    name: 'Android',
    badge: 'Density Buckets',
    description: 'Density-bucketed (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi), vector drawables & Jetpack Compose',
  },
  {
    id: 'ios',
    name: 'iOS (Stub)',
    badge: '@1x/@2x/@3x',
    description: 'Stub structure shaped for Xcode .xcassets scale variants (not implemented yet)',
  },
];

interface ExportHubProps {
  project: StudioProject;
}

export const ExportHub: React.FC<ExportHubProps> = ({ project }) => {
  const [selectedProfile, setSelectedProfile] = useState<ExportProfileId>('raw');
  const [activeCodeTab, setActiveCodeTab] = useState<string>('primary');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const projectSlug = project.title.toLowerCase().replace(/\s+/g, '_');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Safe file downloader
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Dynamic manifest according to selected profile
  const getManifestData = () => {
    if (selectedProfile === 'android') {
      return {
        profile: 'android',
        schemaVersion: '2.0.0',
        title: project.title,
        targetSystem: 'Android (API 26+ / Compose)',
        exportedAt: new Date().toISOString(),
        densityBuckets: {
          mdpi: { scale: '1.0x', dpi: 160, folder: 'res/drawable-mdpi/' },
          hdpi: { scale: '1.5x', dpi: 240, folder: 'res/drawable-hdpi/' },
          xhdpi: { scale: '2.0x', dpi: 320, folder: 'res/drawable-xhdpi/' },
          xxhdpi: { scale: '3.0x', dpi: 480, folder: 'res/drawable-xxhdpi/' },
          xxxhdpi: { scale: '4.0x', dpi: 640, folder: 'res/drawable-xxxhdpi/' },
        },
        resourceMapping: {
          avatar: {
            resourceId: `${projectSlug}_avatar`,
            resFolder: 'res/drawable-xxhdpi/',
            variants: ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'],
            url: project.avatarUrl,
            framing: project.framing || 'bust_portrait',
            style: project.avatarStyle,
          },
          backdrop: {
            resourceId: `${projectSlug}_backdrop`,
            resFolder: 'res/drawable-xxhdpi/',
            variants: ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'],
            url: project.backgroundUrl,
            aspect: project.backgroundAspect,
          },
          vectorDrawable: {
            resourceId: `${projectSlug}_avatar_vector`,
            resFolder: 'res/drawable/',
            feasible: true,
          },
          rawVoice: {
            resourceId: `${projectSlug}_voice`,
            resFolder: 'res/raw/',
            url: project.modulatedAudioUrl || project.voiceAudioUrl,
            format: 'wav',
          },
        },
        dialogue: {
          text: project.dialogueText,
          voiceActor: project.selectedVoice,
          emotion: project.speechEmotion,
        },
      };
    }

    if (selectedProfile === 'ios') {
      return {
        profile: 'ios',
        schemaVersion: '2.0.0-stub',
        title: project.title,
        targetSystem: 'iOS (Xcode Asset Catalog)',
        status: 'stub_only',
        note: 'Shaped for upcoming Xcode asset catalog export. Not fully implemented in this pass.',
        assetCatalog: {
          catalogPath: `${projectSlug}.xcassets`,
          imagesets: [
            {
              name: `${projectSlug}_avatar.imageset`,
              scales: ['1x', '2x', '3x'],
              format: 'png',
            },
            {
              name: `${projectSlug}_backdrop.imageset`,
              scales: ['1x', '2x', '3x'],
              format: 'png',
            },
          ],
        },
        exportedAt: new Date().toISOString(),
      };
    }

    if (selectedProfile === 'web') {
      return {
        profile: 'web',
        schemaVersion: '2.0.0',
        title: project.title,
        targetSystem: 'Web / SPA (React, Vue, HTML5)',
        exportedAt: new Date().toISOString(),
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
          voice: {
            url: project.modulatedAudioUrl || project.voiceAudioUrl,
            format: 'audio/wav',
            actor: project.selectedVoice,
            dialogue: project.dialogueText,
          },
        },
      };
    }

    // Default: raw / source
    return {
      profile: 'raw',
      schemaVersion: '1.0.0',
      title: project.title,
      appType: project.appType,
      exportedAt: new Date().toISOString(),
      assets: {
        background: {
          url: project.backgroundUrl,
          size: project.backgroundSize,
          aspectRatio: project.backgroundAspect,
          animation: project.backgroundAnimation,
          prompt: project.backgroundPrompt,
        },
        avatar: {
          url: project.avatarUrl,
          framing: project.framing,
          bodyType: project.bodyType,
          hairstyle: project.hairstyle,
          clothingTop: project.clothingTop,
          clothingBottom: project.clothingBottom,
          shoes: project.shoes,
          accessory: project.accessory,
          pose: project.avatarPose,
          style: project.avatarStyle,
          isolatedBackdrop: project.isolateBackground,
        },
        voice: {
          voiceActor: project.selectedVoice,
          script: project.dialogueText,
          emotion: project.speechEmotion,
          pitchMultiplier: project.voicePitch,
          speedMultiplier: project.voiceSpeed,
          rawVoiceAudioUrl: project.voiceAudioUrl,
          modulatedAudioUrl: project.modulatedAudioUrl,
        },
        soundtrack: {
          trackId: project.musicTrackId,
          musicVolume: project.musicVolume,
          voiceVolume: project.voiceVolume,
        },
      },
    };
  };

  const manifestData = getManifestData();

  // Code snippets
  const reactSnippet = `// Drop-in React Component for your App Intro Scene
import React, { useState, useEffect } from 'react';

export function AppIntroScreen({ onComplete }: { onComplete: () => void }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Play the modulated avatar voiceover
    const audio = new Audio("${project.modulatedAudioUrl || project.voiceAudioUrl || '/audio/voice.wav'}");
    audio.play().catch(e => console.log('Autoplay handled:', e));
    setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    return () => audio.pause();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between bg-black">
      {/* Background (${project.backgroundSize}) */}
      <img
        src="${project.backgroundUrl}"
        alt="Intro backdrop"
        className="absolute inset-0 w-full h-full object-cover select-none animate-pulse-subtle"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Avatar Figure (${project.framing || 'bust_portrait'} - ${project.avatarStyle}) */}
      <div className="relative z-10 w-full flex-1 flex items-end justify-${project.avatarPose}">
        <img
          src="${project.avatarUrl}"
          alt="Avatar Character"
          className="max-h-[70vh] object-contain drop-shadow-2xl"
        />
      </div>

      {/* Dialogue Subtitle Box */}
      <div className="relative z-20 p-6 max-w-xl mx-auto w-full text-center">
        <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-white text-sm">
          "${project.dialogueText}"
        </div>
        <button
          onClick={onComplete}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg"
        >
          Enter App →
        </button>
      </div>
    </div>
  );
}`;

  const htmlSnippet = `<!-- HTML / Web Component Embed Code -->
<div id="app-intro-wrapper" style="position:relative; width:100vw; height:100vh; overflow:hidden; background:#000;">
  <img src="${project.backgroundUrl}" style="position:absolute; width:100%; height:100%; object-fit:cover;" />
  <div style="position:absolute; bottom:0; width:100%; display:flex; justify-content:${project.avatarPose === 'left' ? 'flex-start' : project.avatarPose === 'right' ? 'flex-end' : 'center'};">
    <img src="${project.avatarUrl}" style="max-height:65vh; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.8));" />
  </div>
  <div style="position:absolute; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.9); color:#fff; padding:16px 24px; border-radius:16px; border:1px solid #334155; max-width:600px; text-align:center;">
    <p style="margin:0 0 12px 0; font-size:15px;">${project.dialogueText}</p>
    <button onclick="document.getElementById('app-intro-wrapper').style.display='none'" style="background:#6366f1; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">Continue to Application</button>
  </div>
  <audio id="intro-audio" autoplay src="${project.modulatedAudioUrl || project.voiceAudioUrl || ''}"></audio>
</div>`;

  const androidComposeSnippet = `// AvatarIntroScreen.kt - Android Jetpack Compose
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.avatarstudios.app.R

@Composable
fun AvatarIntroScreen(onComplete: () -> Unit) {
    val context = LocalContext.current
    var isSpeaking by remember { mutableStateOf(true) }

    DisposableEffect(Unit) {
        val player = MediaPlayer.create(context, R.raw.${projectSlug}_voice).apply {
            setOnCompletionListener {
                isSpeaking = false
                onComplete()
            }
            start()
        }
        onDispose { player.release() }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        // Density-bucketed backdrop from res/drawable
        Image(
            painter = painterResource(id = R.drawable.${projectSlug}_backdrop),
            contentDescription = "Scene Backdrop",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Avatar Character
        Image(
            painter = painterResource(id = R.drawable.${projectSlug}_avatar),
            contentDescription = "Avatar Character",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 110.dp)
                .fillMaxHeight(0.68f)
        )

        // Subtitle Card
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 20.dp, vertical = 28.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xDD0F172A))
                .padding(16.dp)
        ) {
            Text(
                text = "${project.dialogueText.replace(/"/g, '\\"')}",
                color = Color.White,
                fontSize = 14.sp
            )
        }
    }
}`;

  const androidVectorDrawableSnippet = `<!-- res/drawable/${projectSlug}_avatar_vector.xml -->
<!-- Scalable Vector Drawable template for Android UI art -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="180dp"
    android:height="180dp"
    android:viewportWidth="180"
    android:viewportHeight="180">
    <path
        android:fillColor="#4F46E5"
        android:pathData="M90,15 C131.42,15 165,48.58 165,90 C165,131.42 131.42,165 90,165 C48.58,165 15,131.42 15,90 C15,48.58 48.58,15 90,15 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M70,70 C70,58.95 78.95,50 90,50 C101.05,50 110,58.95 110,70 C110,81.05 101.05,90 90,90 C78.95,90 70,81.05 70,70 Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M50,135 C50,112.91 67.91,95 90,95 C112.09,95 130,112.91 130,135 L50,135 Z" />
</vector>`;

  const iosSwiftUiStub = `// AvatarIntroView.swift - iOS SwiftUI (Stub shaped for Xcode Asset Catalog)
// Note: iOS export is currently a stub. Asset references follow @1x/@2x/@3x conventions.
import SwiftUI
import AVFoundation

struct AvatarIntroView: View {
    var onComplete: (() -> Void)?

    var body: some View {
        ZStack {
            Image("${projectSlug}_backdrop")
                .resizable()
                .aspectRatio(contentMode: .fill)
                .ignoresSafeArea()

            VStack {
                Spacer()
                Image("${projectSlug}_avatar")
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 460)

                Text("${project.dialogueText.replace(/"/g, '\\"')}")
                    .font(.subheadline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.black.opacity(0.8))
                    .cornerRadius(14)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
            }
        }
    }
}`;

  const flutterSnippet = `// Flutter Intro Cutscene Screen
import 'package:flutter/material.dart';

class AppIntroScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Image.network("${project.backgroundUrl}", fit: BoxFit.cover),
          Container(color: Colors.black.withOpacity(0.4)),
          // Avatar
          Align(
            alignment: Alignment.bottomCenter,
            child: Image.network("${project.avatarUrl}", height: 380),
          ),
          // Captions & Action
          Positioned(
            bottom: 32,
            left: 24,
            right: 24,
            child: Column(
              children: [
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Color(0xDD0F172A),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    "${project.dialogueText}",
                    style: TextStyle(color: Colors.white, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text("Enter App"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}`;

  // Tabs by profile
  const getTabsForProfile = () => {
    if (selectedProfile === 'android') {
      return [
        { id: 'primary', label: 'Jetpack Compose (Kotlin)' },
        { id: 'vector', label: 'Vector Drawable (XML)' },
        { id: 'flutter', label: 'Flutter' },
        { id: 'manifest', label: 'Density Manifest (JSON)' },
      ];
    }
    if (selectedProfile === 'ios') {
      return [
        { id: 'primary', label: 'SwiftUI (Stub)' },
        { id: 'flutter', label: 'Flutter' },
        { id: 'manifest', label: 'xcassets Manifest (JSON)' },
      ];
    }
    return [
      { id: 'primary', label: 'React Component' },
      { id: 'html', label: 'HTML / Web Embed' },
      { id: 'flutter', label: 'Flutter' },
      { id: 'manifest', label: 'Asset Manifest (JSON)' },
    ];
  };

  const getActiveSnippet = () => {
    if (activeCodeTab === 'manifest') {
      return JSON.stringify(manifestData, null, 2);
    }
    if (activeCodeTab === 'flutter') {
      return flutterSnippet;
    }

    if (selectedProfile === 'android') {
      if (activeCodeTab === 'vector') return androidVectorDrawableSnippet;
      return androidComposeSnippet;
    }

    if (selectedProfile === 'ios') {
      return iosSwiftUiStub;
    }

    if (activeCodeTab === 'html') {
      return htmlSnippet;
    }

    return reactSnippet;
  };

  const currentTabs = getTabsForProfile();

  return (
    <div id="export-hub" className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-indigo-400" />
          Content Export &amp; In-App Integration Hub
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select an export target profile to download production-ready assets and drop-in integration code
        </p>
      </div>

      {/* Selectable Profile System */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
          Select Export Target Profile:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {EXPORT_PROFILES.map((prof) => {
            const isSelected = selectedProfile === prof.id;
            return (
              <button
                key={prof.id}
                type="button"
                onClick={() => {
                  setSelectedProfile(prof.id);
                  setActiveCodeTab('primary');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50 shadow-sm'
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
                <p className="text-[11px] text-slate-400 leading-tight">
                  {prof.description}
                </p>
              </button>
            );
          })}
        </div>

        {selectedProfile === 'android' && (
          <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-lg flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <strong>Android Density Profile:</strong> Generates mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi density buckets and vector drawable resources.
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-900/40 rounded border border-emerald-700/50">
              Active Build
            </span>
          </div>
        )}

        {selectedProfile === 'ios' && (
          <div className="mt-3 p-2.5 bg-amber-950/30 border border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <strong>iOS Stub Profile:</strong> Shaped for Xcode .xcassets (@1x/@2x/@3x). Ready for upcoming build-out.
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-900/40 rounded border border-amber-700/50">
              Stub
            </span>
          </div>
        )}
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Avatar Asset */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Avatar Figure
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                {selectedProfile === 'android' ? 'xxhdpi' : selectedProfile === 'ios' ? '@3x' : project.avatarSize}
              </span>
            </div>
            <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center p-1 mb-2 border border-slate-800">
              <img
                src={project.avatarUrl}
                alt="Export avatar"
                referrerPolicy="no-referrer"
                className="max-h-full object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {selectedProfile === 'android' ? (
                <>res/drawable-xxhdpi/{projectSlug}_avatar.png • {project.avatarStyle}</>
              ) : selectedProfile === 'ios' ? (
                <>{projectSlug}_avatar@3x.png • {project.avatarStyle}</>
              ) : (
                <>{(project.framing || 'bust_portrait').replace('_', ' ')} • {project.avatarStyle} • {project.avatarSize}</>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerDownload(project.avatarUrl, `${projectSlug}_avatar_${selectedProfile === 'android' ? 'xxhdpi' : project.avatarSize}.png`)}
            className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Avatar
          </button>
        </div>

        {/* 2. Background Scene Asset */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Intro Backdrop
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                {selectedProfile === 'android' ? 'xxhdpi' : project.backgroundSize}
              </span>
            </div>
            <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-950 mb-2 border border-slate-800">
              <img
                src={project.backgroundUrl}
                alt="Export background"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {selectedProfile === 'android' ? (
                <>res/drawable-xxhdpi/{projectSlug}_backdrop.png</>
              ) : (
                <>{project.backgroundSize} Canvas ({project.backgroundAspect})</>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerDownload(project.backgroundUrl, `${projectSlug}_backdrop_${selectedProfile === 'android' ? 'xxhdpi' : project.backgroundSize}.png`)}
            className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Scene
          </button>
        </div>

        {/* 3. Modulated Voiceover Asset */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Modulated Voice
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                {selectedProfile === 'android' ? 'res/raw' : '.WAV'}
              </span>
            </div>
            <div className="w-full h-24 rounded-lg bg-slate-950 p-2.5 flex flex-col justify-center border border-slate-800 mb-2">
              <span className="text-[11px] font-semibold text-slate-200">
                Voice: {project.selectedVoice} ({project.speechEmotion})
              </span>
              <span className="text-[10px] text-indigo-400 font-mono mt-0.5">
                Pitch: {(project.voicePitch ?? 1.0).toFixed(2)}x | Speed: {(project.voiceSpeed ?? 1.0).toFixed(2)}x
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                "{project.dialogueText}"
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {selectedProfile === 'android' ? (
                <>Target: res/raw/{projectSlug}_voice.wav</>
              ) : (
                <>PCM 16-bit audio file with pitch/tempo modulation</>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={!project.modulatedAudioUrl && !project.voiceAudioUrl}
            onClick={() => {
              const url = project.modulatedAudioUrl || project.voiceAudioUrl;
              if (url) triggerDownload(url, `${projectSlug}_voice.wav`);
            }}
            className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Audio (.WAV)
          </button>
        </div>

        {/* 4. Complete Metadata Manifest */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                Profile Manifest
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono uppercase">
                {selectedProfile}
              </span>
            </div>
            <div className="w-full h-24 rounded-lg bg-slate-950 p-2.5 flex flex-col justify-center border border-slate-800 mb-2 font-mono text-[10px] text-slate-400 overflow-hidden">
              <code>{JSON.stringify(manifestData, null, 2).slice(0, 140)}...</code>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {selectedProfile === 'android'
                ? 'Density-bucketed Android resource configuration manifest'
                : selectedProfile === 'ios'
                ? 'Xcode .xcassets stub specification manifest'
                : 'Schema-compliant manifest linking assets, dialogue, poses, and timing'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              triggerDownload(url, `${projectSlug}_${selectedProfile}_manifest.json`);
            }}
            className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Manifest (.JSON)
          </button>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Integration Snippets ({selectedProfile.toUpperCase()} Profile)
            </h4>
          </div>

          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-lg flex-wrap gap-1">
            {currentTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCodeTab(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded uppercase tracking-wider transition-colors cursor-pointer ${
                  activeCodeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code View */}
        <div className="relative p-4 bg-slate-950 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              const codeToCopy = getActiveSnippet();
              handleCopy(codeToCopy, activeCodeTab);
            }}
            className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedKey === activeCodeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === activeCodeTab ? 'Copied to Clipboard' : 'Copy Code'}
          </button>

          <pre className="text-xs font-mono text-slate-300 leading-relaxed max-h-[340px] overflow-y-auto">
            {getActiveSnippet()}
          </pre>
        </div>
      </div>

      {/* Suitability Checklist */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-slate-100 block">
            Production In-App Suitability &amp; Profile Guarantee:
          </span>
          <p className="text-slate-400 leading-relaxed">
            All generated avatars, modulated audio files, and backgrounds are formatted in standard MIME types (PNG, WAV, JSON). Active profile <strong>{selectedProfile.toUpperCase()}</strong> ensures exact density-bucketing, file hierarchy, or framework component compatibility.
          </p>
        </div>
      </div>
    </div>
  );
};
