// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export const handler = async (event: any) => {
  return { isAuthorized: event.headers.authorization === 'ChangeMe' };
};
