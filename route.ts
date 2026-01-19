import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'ti';
  
  const apiKey = 'pub_16619a893e3b476b93d24cad8ff83750';
  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${q}&language=pt`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Adapta o formato
    const adaptedData = {
      articles: data.results?.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.link,
        urlToImage: article.image_url,
        publishedAt: article.pubDate,
        source: {
          name: article.source_id
        }
      })) || [],
      totalResults: data.totalResults || 0
    };
    
    return NextResponse.json(adaptedData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar notícias' },
      { status: 500 }
    );
  }
}