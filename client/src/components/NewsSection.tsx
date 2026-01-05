import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Newspaper,
  TrendingUp,
  Building2,
  Globe,
  ExternalLink,
  Clock,
  RefreshCw,
  Rss,
} from "lucide-react";
import { useState } from "react";

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof TrendingUp; color: string }> = {
  economia: {
    label: "Economia",
    icon: TrendingUp,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  mercado: {
    label: "Mercado",
    icon: TrendingUp,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  politica: {
    label: "Política",
    icon: Building2,
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  internacional: {
    label: "Internacional",
    icon: Globe,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} min`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays === 1) {
    return "ontem";
  } else {
    return `${diffDays}d`;
  }
}

interface NewsItemProps {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  link?: string;
  publishedAt: Date;
  category: string;
  featured?: boolean;
}

function NewsItem({
  title,
  summary,
  source,
  sourceUrl,
  link,
  publishedAt,
  category,
  featured = false,
}: NewsItemProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.economia;
  const Icon = config.icon;
  const href = link || sourceUrl;

  if (featured) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-300 h-full">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(publishedAt)}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {summary}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{source}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-4 rounded-lg bg-card/50 hover:bg-card border border-border/50 hover:border-border transition-all duration-200">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className={`${config.color} text-[10px] px-1.5 py-0`}>
                {config.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {formatRelativeTime(publishedAt)}
              </span>
            </div>
            <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{summary}</p>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {source}
            </span>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
        </div>
      </div>
    </a>
  );
}

function NewsItemSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <Card className="h-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-3" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-card/50 border border-border/50">
      <div className="flex items-center gap-2 mb-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export default function NewsSection() {
  const [activeTab, setActiveTab] = useState<"curated" | "rss">("curated");
  
  // Notícias curadas (estáticas)
  const { data: curatedNews, isLoading: curatedLoading, refetch: refetchCurated } = trpc.news.latest.useQuery({ limit: 6 });
  
  // Notícias RSS (tempo real)
  const { data: rssNews, isLoading: rssLoading, refetch: refetchRss } = trpc.news.rss.useQuery({ limit: 10 });

  const handleRefresh = () => {
    if (activeTab === "curated") {
      refetchCurated();
    } else {
      refetchRss();
    }
  };

  const isLoading = activeTab === "curated" ? curatedLoading : rssLoading;
  const news = activeTab === "curated" ? curatedNews : rssNews;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notícias Econômicas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Rss className="h-3 w-3" />
              Feed RSS
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "curated" | "rss")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="curated">Destaques</TabsTrigger>
            <TabsTrigger value="rss">Feed em Tempo Real</TabsTrigger>
          </TabsList>

          <TabsContent value="curated">
            {curatedLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <NewsItemSkeleton featured />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <NewsItemSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : curatedNews && curatedNews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <NewsItem
                    title={curatedNews[0].title}
                    summary={curatedNews[0].summary}
                    source={curatedNews[0].source}
                    sourceUrl={curatedNews[0].sourceUrl}
                    publishedAt={curatedNews[0].publishedAt}
                    category={curatedNews[0].category}
                    featured
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  {curatedNews.slice(1).map((item) => (
                    <NewsItem
                      key={item.id}
                      title={item.title}
                      summary={item.summary}
                      source={item.source}
                      sourceUrl={item.sourceUrl}
                      publishedAt={item.publishedAt}
                      category={item.category}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma notícia disponível no momento</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rss">
            {rssLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <NewsItemSkeleton key={i} />
                ))}
              </div>
            ) : rssNews && rssNews.length > 0 ? (
              <div className="space-y-3">
                {rssNews.map((item) => (
                  <NewsItem
                    key={item.id}
                    title={item.title}
                    summary={item.summary}
                    source={item.source}
                    sourceUrl={item.sourceUrl}
                    link={item.link}
                    publishedAt={item.publishedAt}
                    category={item.category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Rss className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Não foi possível carregar o feed RSS</p>
                <p className="text-xs mt-1">Tente novamente mais tarde</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
