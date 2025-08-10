import type { UserResponse, CreateUserDto, UpdateUserDto, LoginUserDto } from "@habit-tracker/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from 'ky';

const BACKEND_BASE_URL = "http://localhost:8080";

const KY_FETCH_RETRY_NUM = 0;
const REACT_QUERY_RETRY_NUM = 0;

/**
 * /users
 */

async function postCreateUser(newUser: CreateUserDto): Promise<UserResponse> {
  return ky.post(`${BACKEND_BASE_URL}/users`, { retry: KY_FETCH_RETRY_NUM, json: newUser }).json();
}

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: (newUser: CreateUserDto) => { return postCreateUser(newUser) },
  })
}

async function patchUpdateUser(userId: number, updateUser: UpdateUserDto): Promise<UserResponse> {
  return ky.patch(`${BACKEND_BASE_URL}/users/${userId}`, { retry: KY_FETCH_RETRY_NUM, json: updateUser }).json();
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: ({ id, update }: { id: number, update: UpdateUserDto }) => { return patchUpdateUser(id, update) },
  })
}

async function deleteUser(userId: number): Promise<{}> {
  return ky.delete(`${BACKEND_BASE_URL}/users/${userId}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: (userId: number) => { return deleteUser(userId) },
  })
}

// TODOs: refactor all BACKEND_BASE_URL usages to instead refer to api
async function postLoginUser(user: LoginUserDto) {
  return ky.post(`/api/auth/login`, { retry: KY_FETCH_RETRY_NUM, json: user }).json();
}

export function useLoginUserMutation() {
  return useMutation({
    mutationFn: (user: LoginUserDto) => { return postLoginUser(user) },
  })
}

// TODOs check: logout shouldn't need post body as should already have auth bearer token 
async function postLogoutUser() {
  return ky.post(`${BACKEND_BASE_URL}/auth/logout`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useLogoutUserMutation() {
  return useMutation({
    mutationFn: () => { return postLogoutUser() },
  })
}