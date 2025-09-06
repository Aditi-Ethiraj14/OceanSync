import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock data for dashboard content
const mockOceanNews = [
  {
    id: "1",
    title: "New Marine Protected Area Established",
    description: "California announces new protections for coastal waters...",
    imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  },
  {
    id: "2",
    title: "Fishing Season Updates",
    description: "New regulations for recreational fishing take effect...",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  },
];

const mockPrograms = [
  {
    id: "1",
    title: "Beach Clean-up Incentive",
    description: "Earn rewards for participating in community beach cleanups",
    type: "primary",
  },
  {
    id: "2",
    title: "Coastal Safety Training",
    description: "Free water safety courses for community members",
    type: "secondary",
  },
];

export function DashboardTab() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Ocean Dashboard</h2>
      
      {/* Weather/Ocean Conditions */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-foreground mb-3">Current Conditions</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl text-primary mb-1" data-testid="text-water-temp">72°F</div>
            <div className="text-xs text-muted-foreground">Water Temp</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-secondary mb-1" data-testid="text-wave-height">3-5ft</div>
            <div className="text-xs text-muted-foreground">Wave Height</div>
          </div>
        </div>
      </div>

      {/* Latest News */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-foreground mb-3">Latest Ocean News</h3>
        <div className="space-y-3">
          {mockOceanNews.map((news) => (
            <div key={news.id} className="flex space-x-3" data-testid={`news-item-${news.id}`}>
              <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover rounded-lg" 
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground" data-testid={`text-news-title-${news.id}`}>
                  {news.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1" data-testid={`text-news-description-${news.id}`}>
                  {news.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Government Schemes */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-foreground mb-3">Government Programs</h3>
        <div className="space-y-3">
          {mockPrograms.map((program) => (
            <div 
              key={program.id} 
              className={`${program.type === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'} rounded-lg p-3`}
              data-testid={`program-item-${program.id}`}
            >
              <h4 className="text-sm font-medium text-foreground" data-testid={`text-program-title-${program.id}`}>
                {program.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1" data-testid={`text-program-description-${program.id}`}>
                {program.description}
              </p>
              <Button 
                variant="link" 
                size="sm" 
                className={`mt-2 ${program.type === 'primary' ? 'text-primary' : 'text-secondary'} text-xs font-medium p-0 h-auto`}
                data-testid={`button-program-action-${program.id}`}
              >
                {program.type === 'primary' ? 'Learn More' : 'Register'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Advertisements */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 text-primary-foreground">
            <h4 className="font-medium mb-1">Ocean Safety App</h4>
            <p className="text-xs opacity-90">Real-time beach conditions & safety alerts</p>
            <Button 
              size="sm" 
              variant="secondary"
              className="mt-2 bg-white/20 hover:bg-white/30 text-primary-foreground"
              data-testid="button-download-app"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
