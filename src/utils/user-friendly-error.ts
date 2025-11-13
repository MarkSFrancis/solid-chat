export interface UserFriendlyError {
  message: string;
}

export function toUserFriendlyError(
  error: unknown
): UserFriendlyError | undefined {
  if (error === undefined) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  } else if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  return {
    message: 'An unexpected error occurred.',
  };
}
