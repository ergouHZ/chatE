export function encodeQueryParams(params) {
  const queryString = new URLSearchParams(params).toString();
  return btoa(queryString);
}
//加密解密方法
export function decodeQueryParams(encodedParams) {
  const queryString = atob(encodedParams);
  return new URLSearchParams(queryString);
}

//图片模型
export const changeToThumb = (modelName) => {
  if (modelName === 'claude-instant-1.2') {
    return 'https://qph.cf2.poecdn.net/main-thumb-pb-1011-200-phggnnskbfadkgntvkacpazkogidumhg.jpeg'
  } else if (modelName === 'gpt-3.5-turbo-0125') {
    return 'https://qph.cf2.poecdn.net/main-thumb-pb-3004-200-jougqzjtwfqfyqprxbdwofvnwattmtrg.jpeg'
  } else if (modelName === 'deepseek-chat') {
    return 'https://qph.cf2.poecdn.net/main-thumb-pb-3659661-200-rhbmapadjmovyhaysjskpljibhdqepvj.jpeg'
  } else if (modelName === 'deepseek-coder') {
    return 'https://qph.cf2.poecdn.net/main-thumb-pb-4160236-200-heangijlygymiopfccxqfalgookgdehp.jpeg'
  } else if (modelName === 'gpt-4o-2024-05-13') {
    return 'https://qph.cf2.poecdn.net/main-thumb-pb-3015-200-ivodfqemfvztmvgafhdouijhknthkvmp.jpeg'
  } else if (modelName === 'claude-3-sonnet-20240229') {
    return 'https://qph.cf2.poecdn.net/main-thumb-pb-1011-200-phggnnskbfadkgntvkacpazkogidumhg.jpeg'
  }
  // 如果没有匹配的模型名称，可以返回一个默认图片或者空字符串
  return ''


}

export const modifyName = (modelName) => {
  if (modelName === 'claude-instant-1.2') {
    return 'claude-instant'
  } else if (modelName === 'gpt-3.5-turbo-0125') {
    return 'gpt-3.5-turbo'
  } else if (modelName === 'gpt-4o-2024-05-13') {
    return 'gpt-4o'
  } else if (modelName === 'claude-3-sonnet-20240229') {
    return 'claude-3-sonnet'
  }
  // 如果没有匹配的模型名称，返回原名
  return modelName
}

