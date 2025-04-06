// stores/selectionStore.js - 선택 및 드래그 상태 관리
import { writable } from 'svelte/store';

export const selectedComponent = writable(null);
export const draggedComponent = writable(null);