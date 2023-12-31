'use server'

import { and, eq } from "drizzle-orm";
import db from "./db";
import { folders, workspaces, files, collaborators, users } from "./schema";
import { fileType, folderType, userType, workspaceType } from "./types";


export const updateUser = async (
  user: Partial<userType>,
  userId: string
) => {
  try {
    const response = await db
      .update(users)
      .set(user)
      .where(eq(users.id, userId ));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};


export const createWorkspace = async (workspace: workspaceType) => {
    try {
      const response = await db
        .insert(workspaces)
        .values(workspace);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: "Error" };
    }
  };
  
export const createFolder = async (folder: folderType) => {
  try {
    const response = await db.insert(folders).values(folder);
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
};

export const updateFolder = async (folder: Partial<folderType>, folderId: string) => {
  try {
    const response = await db.update(folders).set(folder).where(eq(folders.id, folderId));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
}
export const createFile = async (file: fileType) => {
  try {
    const response = await db.insert(files).values(file)
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
}
export const updateFile = async (file: Partial<fileType>, fileId: string) => {
  try {
    const response = await db.update(files).set(file).where(eq(files.id, fileId));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
}

export const deleteFile = async (fileId: string) => {
  if (!fileId) return;
  try {
    const response = await db.delete(files).where(eq(files.id, fileId));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }

};

export const deleteFolder = async (folderId: string) => {
  if (!folderId) return;
  try {
    const response = await db.delete(files).where(eq(files.id, folderId));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};

export const updateWorkspace = async (
  workspace: Partial<workspaceType>,
  workspaceId: string
) => {
  try {
    const response = await db
      .update(workspaces)
      .set(workspace)
      .where(eq(workspaces.id, workspaceId));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};


export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return;
  try {
    const response = await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};

export const addCollaborators = async (users: userType[], workspaceId: string) => {
  const response = users.forEach(async (user: userType) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });
    if (!userExists)
      await db.insert(collaborators).values({ workspaceId, userId: user.id });
  });
};



export const removeCollaborators = async (
  users: userType[],
  workspaceId: string
) => {
  const response = users.forEach(async (user: userType) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });
    if (userExists)
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            eq(collaborators.userId, user.id)
          )
        );
  });
};
