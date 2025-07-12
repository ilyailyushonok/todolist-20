import { baseApi } from "@/app/baseApi"
import type { BaseResponse } from "@/common/types"
import type { DomainTodolist } from "@/features/todolists/lib/types"
import type { Todolist } from "./todolistsApi.types"

export const todolistsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodolists: build.query<DomainTodolist[], void>({
      query: () => "todo-lists",
      transformResponse: (todolists: Todolist[]): DomainTodolist[] =>
        todolists.map((todolist) => ({ ...todolist, filter: "all", entityStatus: "idle" })),
      providesTags: ["Todolist"],
    }),
    addTodolist: build.mutation<BaseResponse<{ item: Todolist }>, string>({
      query: (title) => ({
        url: "todo-lists",
        method: "POST",
        body: { title },
      }),
      invalidatesTags: ["Todolist"],
    }),
    removeTodolist: build.mutation<BaseResponse, string>({
      query: (id:string) => {
        return { url: `todo-lists/${id}`, method: "DELETE" }
      },
      async onQueryStarted(id, { queryFulfilled, dispatch, getState }) {
        const patchResult = dispatch(
          todolistsApi.util.updateQueryData("getTodolists", undefined, (state) => {
            const index = state.findIndex((todo) => todo.id === id)
            if (index !== -1) state.splice(index, 1)
          }),
        )

        try {
          await queryFulfilled
        } catch (err) {
          const state = getState()
          const res = todolistsApi.endpoints.getTodolists.select()(state)
          const isExist = res.data?.some((tl) => tl.id === id)
          if (!isExist) {
            patchResult.undo()
          }
        }
      },
      invalidatesTags: ["Todolist"],
    }),
    updateTodolistTitle: build.mutation<BaseResponse, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `todo-lists/${id}`,
        method: "PUT",
        body: { title },
      }),
      invalidatesTags: ["Todolist"],
    }),
  }),
})

export const {
  useGetTodolistsQuery,
  useAddTodolistMutation,
  useRemoveTodolistMutation,
  useUpdateTodolistTitleMutation,
} = todolistsApi

// export const _todolistsApi = {
//   getTodolists() {
//     return instance.get<Todolist[]>("/todo-lists")
//   },
//   changeTodolistTitle(payload: { id: string; title: string }) {
//     const { id, title } = payload
//     return instance.put<BaseResponse>(`/todo-lists/${id}`, { title })
//   },
//   createTodolist(title: string) {
//     return instance.post<BaseResponse<{ item: Todolist }>>("/todo-lists", { title })
//   },
//   deleteTodolist(id: string) {
//     return instance.delete<BaseResponse>(`/todo-lists/${id}`)
//   },
// }


// const state = getState()
// const res = todolistsApi.endpoints.getTodolists.select()(state)
// const exists = res.data?.some((todo) => todo.id === id)
// if (!exists) {
//   patchResult.undo()
// }
