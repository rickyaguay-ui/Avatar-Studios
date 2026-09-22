import {
  auth,
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
} from './firebase.ts';
import type { User } from './firebase.ts';
import { ProjectFolder } from '../types.ts';

/**
 * Loads all projects saved in user's Firestore cloud database.
 */
export async function loadUserProjectsFromFirestore(userId: string): Promise<ProjectFolder[]> {
  try {
    const projectsCol = collection(db, 'users', userId, 'projects');
    const snapshot = await getDocs(projectsCol);
    const projects: ProjectFolder[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ProjectFolder;
      projects.push(data);
    });
    return projects;
  } catch (error) {
    console.error('Error loading projects from Firestore:', error);
    return [];
  }
}

/**
 * Saves or updates a project document in user's Firestore cloud database.
 */
export async function saveProjectToFirestore(userId: string, project: ProjectFolder): Promise<void> {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    await setDoc(projectRef, project, { merge: true });
  } catch (error) {
    console.error(`Error saving project ${project.id} to Firestore:`, error);
  }
}

/**
 * Deletes a project from user's Firestore cloud database.
 */
export async function deleteProjectFromFirestore(userId: string, projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error(`Error deleting project ${projectId} from Firestore:`, error);
  }
}

export type { User };
export { auth, signInWithGoogle, signOutUser, onAuthStateChanged };
