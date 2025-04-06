// stores/componentStore.js - 회로 컴포넌트 관리 스토어
import { writable } from 'svelte/store';
// import componentData from '../data/componentLibrary';

// 초기 스토어 상태
const initialState = {
  components: [],
  connections: [],
};

function createComponentStore() {
  const { subscribe, set, update } = writable(initialState);
  
  return {
    subscribe,
    
    // 기본 컴포넌트 로드
    loadDefaultComponents: () => {
      // 필요한 경우 초기 컴포넌트 로드
    },
    
    // 컴포넌트 추가
    addComponent: (component) => {
      update(state => ({
        ...state,
        components: [...state.components, component]
      }));
    },
    
    // 컴포넌트 업데이트
    updateComponent: (id, updates) => {
      update(state => ({
        ...state,
        components: state.components.map(comp => 
          comp.id === id ? { ...comp, ...updates } : comp
        )
      }));
    },
    
    // 컴포넌트 이동
    moveComponent: (id, dx, dy) => {
      update(state => ({
        ...state,
        components: state.components.map(comp => {
          if (comp.id === id) {
            return {
              ...comp,
              x: comp.x + dx,
              y: comp.y + dy
            };
          }
          return comp;
        }),
        // 해당 컴포넌트에 연결된 와이어도 함께 업데이트
        connections: state.connections.map(conn => {
          let updated = { ...conn };
          
          if (conn.from.componentId === id) {
            updated.from = {
              ...conn.from,
              x: conn.from.x + dx,
              y: conn.from.y + dy
            };
          }
          
          if (conn.to.componentId === id) {
            updated.to = {
              ...conn.to,
              x: conn.to.x + dx,
              y: conn.to.y + dy
            };
          }
          
          return updated;
        })
      }));
    },
    
    // 컴포넌트 삭제
    removeComponent: (id) => {
      update(state => ({
        ...state,
        components: state.components.filter(comp => comp.id !== id),
        // 해당 컴포넌트와 연결된 모든 와이어도 삭제
        connections: state.connections.filter(conn => 
          conn.from.componentId !== id && conn.to.componentId !== id
        )
      }));
    },
    
    // 연결 추가
    addConnection: (connection) => {
      update(state => ({
        ...state,
        connections: [...state.connections, connection]
      }));
    },
    
    // 연결 삭제
    removeConnection: (id) => {
      update(state => ({
        ...state,
        connections: state.connections.filter(conn => conn.id !== id)
      }));
    },
    
    // 상태 초기화
    reset: () => {
      set(initialState);
    },
    
    // 프로젝트 로드
    loadProject: (projectData) => {
      set(projectData);
    }
  };
}

export const componentStore = createComponentStore();