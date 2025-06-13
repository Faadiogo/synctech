export const cloudinaryService = {
  async uploadImage(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      throw new Error('Cloudinary não configurado. Verifique as variáveis de ambiente.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'synctech_clients');
    formData.append('folder', 'synctech/clients');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 400) {
          throw new Error('Erro 400: Verifique se o upload preset "synctech_clients" existe e está configurado como unsigned.');
        } else if (response.status === 401) {
          throw new Error('Erro 401: Problema de autenticação. Verifique o upload preset.');
        } else {
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw error;
    }
  },

  getOptimizedImageUrl(url: string, width: number = 150, height: number = 150): string {
    if (!url || !url.includes('cloudinary')) {
      return url;
    }

    // Inserir transformações do Cloudinary na URL
    const transformations = `c_fill,w_${width},h_${height},q_auto,f_auto`;
    return url.replace('/upload/', `/upload/${transformations}/`);
  }
}; 