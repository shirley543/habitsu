import type { UserResponse, CreateUserDto, UpdateUserDto, LoginUserDto } from "@habit-tracker/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from 'ky';

const KY_FETCH_RETRY_NUM = 0;
const REACT_QUERY_RETRY_NUM = 0;

// prefixUrl replaced by Vite proxy in dev to avoid CORS issues
const api = ky.create({
  prefixUrl: '/api',
  credentials: 'include',
  retry: KY_FETCH_RETRY_NUM,
});

/**
 * /users
 */

async function postCreateUser(newUser: CreateUserDto): Promise<UserResponse> {
  return api.post('users', { json: newUser }).json();
}

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: (newUser: CreateUserDto) => { return postCreateUser(newUser) },
  })
}

async function patchUpdateUser(userId: number, updateUser: UpdateUserDto): Promise<UserResponse> {
  return api.patch(`users/${userId}`, { json: updateUser }).json();
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: ({ id, update }: { id: number, update: UpdateUserDto }) => { return patchUpdateUser(id, update) },
  })
}

async function deleteUser(userId: number): Promise<{}> {
  return api.delete(`users/${userId}`).json();
}

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: (userId: number) => { return deleteUser(userId) },
  })
}

async function postLoginUser(user: LoginUserDto) {
  return api.post('auth/login', { json: user }).json();
}

export function useLoginUserMutation() {
  return useMutation({
    mutationFn: (user: LoginUserDto) => { return postLoginUser(user) },
  })
}

// TODOs check: logout shouldn't need post body as should already have auth bearer token 
async function postLogoutUser() {
  return api.post('auth/logout').json();
}

export function useLogoutUserMutation() {
  return useMutation({
    mutationFn: () => { return postLogoutUser() },
  })
}