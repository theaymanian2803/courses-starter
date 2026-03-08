import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Users, ShoppingCart, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EnrollModal } from "@/components/checkout/EnrollModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
};

type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "title-az" | "title-za";
type PriceFilter = "all" | "free" | "under25" | "under50" | "50plus";

const COURSES_PER_PAGE = 9;

export function Courses() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    let result = [...courses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    switch (priceFilter) {
      case "free":
        result = result.filter((c) => c.price === 0);
        break;
      case "under25":
        result = result.filter((c) => c.price > 0 && c.price < 25);
        break;
      case "under50":
        result = result.filter((c) => c.price > 0 && c.price < 50);
        break;
      case "50plus":
        result = result.filter((c) => c.price >= 50);
        break;
    }

    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "title-az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [courses, searchQuery, priceFilter, sortBy]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedCourses = useMemo(() => {
    const start = (safeCurrentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourses, safeCurrentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: PriceFilter) => {
    setPriceFilter(filter);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const hasActiveFilters = priceFilter !== "all" || sortBy !== "newest";

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Price Range</label>
        <Select value={priceFilter} onValueChange={(v) => handleFilterChange(v as PriceFilter)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="under25">Under $25</SelectItem>
            <SelectItem value="under50">Under $50</SelectItem>
            <SelectItem value="50plus">$50+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Sort By</label>
        <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortOption)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="title-az">Title: A–Z</SelectItem>
            <SelectItem value="title-za">Title: Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full text-muted-foreground">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear All Filters
        </Button>
      )}

      <div className="pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section id="courses" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Courses</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Master in-demand skills with our comprehensive courses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <section id="courses" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Courses</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">New courses coming soon! Stay tuned for exciting content.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Courses</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Master in-demand skills with our comprehensive, project-based courses</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <aside className="w-64 shrink-0">
              <div className="sticky top-28 rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                {filterContent}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter trigger */}
            {isMobile && (
              <div className="mb-6">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters & Search
                      {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-primary" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {filterContent}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {filteredCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No courses match your search. Try a different keyword.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card"
                    >
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <BookOpen className="h-16 w-16 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                          ${course.price}
                        </div>
                      </div>

                      <CardHeader className="pb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                      </CardHeader>

                      <CardContent className="pb-4">
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                          {course.description || "No description available."}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Self-paced</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>All levels</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 gap-2">
                        <Button onClick={() => handleViewCourse(course.id)} variant="outline" className="flex-1" size="lg">
                          View Course
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); setEnrollCourse(course); }}
                          className="flex-1"
                          size="lg"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Enroll
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safeCurrentPage <= 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button key={page} variant={page === safeCurrentPage ? "default" : "outline"} size="icon" onClick={() => setCurrentPage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {enrollCourse && (
        <EnrollModal
          open={!!enrollCourse}
          onOpenChange={(open) => !open && setEnrollCourse(null)}
          course={enrollCourse}
        />
      )}
    </section>
  );
}
