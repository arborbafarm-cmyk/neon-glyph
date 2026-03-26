/**
 * SKILL TREE SERVICE - Skill Management
 * 
 * Handles skill tree operations and progression
 */

import { getPlayer, savePlayer } from './playerCoreService';
import { Players } from '@/entities';

export type SkillTreeType = 'attack' | 'defense' | 'intelligence' | 'respect';

/**
 * Parse skillTrees from JSON string
 */
function parseSkillTrees(skillTreesJson: string | undefined) {
  if (!skillTreesJson) {
    return {
      attack: {},
      defense: {},
      intelligence: {},
      respect: {},
    };
  }
  try {
    return JSON.parse(skillTreesJson);
  } catch {
    return {
      attack: {},
      defense: {},
      intelligence: {},
      respect: {},
    };
  }
}

/**
 * Stringify skillTrees to JSON
 */
function stringifySkillTrees(skillTrees: any): string {
  return JSON.stringify(skillTrees);
}

/**
 * Unlock a skill in a skill tree
 */
export async function unlockSkill(
  playerId: string,
  treeType: SkillTreeType,
  skillId: string
): Promise<Players> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const skillTrees = parseSkillTrees(player.skillTrees);

  if (!skillTrees[treeType]) {
    skillTrees[treeType] = {};
  }

  skillTrees[treeType][skillId] = true;

  const updated = {
    ...player,
    skillTrees: stringifySkillTrees(skillTrees),
  };

  return savePlayer(updated);
}

/**
 * Check if skill is unlocked
 */
export async function isSkillUnlocked(
  playerId: string,
  treeType: SkillTreeType,
  skillId: string
): Promise<boolean> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const skillTrees = parseSkillTrees(player.skillTrees);
  return skillTrees[treeType]?.[skillId] ?? false;
}

/**
 * Get all skills in a tree
 */
export async function getSkillsInTree(
  playerId: string,
  treeType: SkillTreeType
): Promise<Record<string, boolean>> {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const skillTrees = parseSkillTrees(player.skillTrees);
  return skillTrees[treeType] || {};
}

/**
 * Get all skill trees
 */
export async function getAllSkillTrees(playerId: string) {
  const player = await getPlayer(playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  return parseSkillTrees(player.skillTrees);
}

/**
 * Count unlocked skills in a tree
 */
export async function countUnlockedSkills(
  playerId: string,
  treeType: SkillTreeType
): Promise<number> {
  const skills = await getSkillsInTree(playerId, treeType);
  return Object.values(skills).filter((unlocked) => unlocked).length;
}
