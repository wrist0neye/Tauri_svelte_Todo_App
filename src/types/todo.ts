export interface ITodo {
  id: string
  text: string
  completed: boolean
}

export type FiltersType = 'all' | 'active' | 'completed'

export interface Docs {
  id: string;
  name : string;
  content : string;// | HTMLTextAreaElement;
  prev_stack : string | null;
}