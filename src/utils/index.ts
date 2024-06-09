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
    return 'https://www.auraxplorers.com/cdn/image/claude1.png'
  } else if (modelName === 'gpt-3.5-turbo-0125'||modelName === 'gpt-3.5-turbo-instruct') {
    return 'https://www.auraxplorers.com/cdn/image/gpt3.5.jpeg'
  } else if (modelName === 'deepseek-chat') {
    return 'https://www.auraxplorers.com/cdn/image/deepseek-chat.jpeg'
  } else if (modelName === 'deepseek-coder') {
    return 'https://www.auraxplorers.com/cdn/image/deepseek-coder.jpeg'
  } else if (modelName === 'gpt-4o-2024-05-13') {
    return 'https://www.auraxplorers.com/cdn/image/main-thumb-gpt4o.jpeg'
  } else if (modelName === 'claude-3-sonnet-20240229') {
    return 'https://www.auraxplorers.com/cdn/image/claude3-red.jpeg'
  }else if (modelName === 'dall-e-3') {
    return 'https://www.auraxplorers.com/cdn/image/dalle3.jpeg'
  }else if (modelName === 'dall-e-2') {
    return 'https://www.auraxplorers.com/cdn/image/dalle2.jpeg'
  }else if (modelName === 'sd3') {
    return 'https://www.auraxplorers.com/cdn/image/sd3.jpeg'
  }else if (modelName === 'claude-3-haiku-20240307') {
    return 'https://www.auraxplorers.com/cdn/image/claude3-haiku.jpeg'
  }else if (modelName === 'claude-3-opus-20240229') {
    return 'https://www.auraxplorers.com/cdn/image/claude3-opus.jpeg'
  }else if (modelName === 'claude-3-sonnet-20240229') {
    return 'https://www.auraxplorers.com/cdn/image/claude3-red.jpeg'
  }else if (modelName === 'gpt-4-turbo-2024-04-09'||modelName === 'gpt-4-turbo') {
    return 'https://www.auraxplorers.com/cdn/image/gpt4.jpeg'
  }
  else if (modelName === 'claude-2.0') {
    return 'https://www.auraxplorers.com/cdn/image/claude2.png'
  }
  
  
  // 如果没有匹配的模型名称，可以返回一个默认图片或者空字符串
  return 'https://www.auraxplorers.com/cdn/image/logo.png'


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
  } else if (modelName === 'sd3') {
    return 'stable diffusion3'
  } else if (modelName === 'claude-3-haiku-20240307') {
    return 'claude-3-haiku'
  } else if (modelName ==='gpt-4-turbo-2024-04-09'){
    return 'gpt-4-turbo'
  } 
  // 如果没有匹配的模型名称，返回原名
  return modelName
}

